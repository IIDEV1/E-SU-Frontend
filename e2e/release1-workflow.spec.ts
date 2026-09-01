import { expect, test, type Browser, type Page, type PlaywrightTestArgs } from "@playwright/test";

type Credentials = {
  email: string;
  password: string;
};

type UserDto = {
  id: string;
  email: string;
  full_name: string;
};

type LoginDto = {
  access: string;
};

type CategoryDto = {
  id: string;
};

const requiredEnvironment = [
  "E2E_EMPLOYEE_EMAIL",
  "E2E_EMPLOYEE_PASSWORD",
  "E2E_MANAGER_EMAIL",
  "E2E_MANAGER_PASSWORD",
  "E2E_OFFICE_EMAIL",
  "E2E_OFFICE_PASSWORD",
  "E2E_ADMIN_EMAIL",
  "E2E_ADMIN_PASSWORD",
] as const;

const apiURL = (process.env.E2E_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");

function credentials(prefix: "EMPLOYEE" | "MANAGER" | "OFFICE" | "ADMIN"): Credentials {
  return {
    email: process.env[`E2E_${prefix}_EMAIL`] ?? "",
    password: process.env[`E2E_${prefix}_PASSWORD`] ?? "",
  };
}

function unwrap<T>(body: unknown): T {
  if (typeof body === "object" && body !== null && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function apiLogin(request: PlaywrightTestArgs["request"], account: Credentials) {
  const response = await request.post(`${apiURL}/auth/login/`, {
    data: account,
  });
  expect(response, "fixture login must succeed").toBeOK();
  return unwrap<LoginDto>(await response.json()).access;
}

async function createCategoryFixture(request: PlaywrightTestArgs["request"], suffix: string) {
  const token = await apiLogin(request, credentials("ADMIN"));
  const response = await request.post(`${apiURL}/document-categories/`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      name: `E2E category ${suffix}`,
      code: `e2e-${suffix.toLowerCase()}`.slice(0, 50),
      description: "E2E workflow category",
      retention_period_days: 30,
      requires_file: true,
      allowed_departments: [],
      status: "active",
    },
  });
  expect(response, "creating the E2E category must succeed").toBeOK();
  return unwrap<CategoryDto>(await response.json());
}

async function userByEmail(request: PlaywrightTestArgs["request"], account: Credentials, email: string) {
  const token = await apiLogin(request, account);
  const response = await request.get(`${apiURL}/users/`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page_size: "100", search: email },
  });
  expect(response, "loading real approver fixture must succeed").toBeOK();
  const page = unwrap<{ results: UserDto[] }>(await response.json());
  const user = page.results.find((item) => item.email === email);
  expect(user, `backend did not return user ${email}`).toBeTruthy();
  return user as UserDto;
}

async function login(browser: Browser, account: Credentials) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.locator("input[type='password']").fill(account.password);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL(/\/dashboard$/);
  return { context, page };
}

async function confirmAction(page: Page, action: RegExp) {
  await page.getByRole("button", { name: action }).click();
  await page.getByRole("button", { name: "Подтвердить" }).click();
  await expect(page.locator(".modal-backdrop")).toHaveCount(0);
}

test.describe("Release 1 document lifecycle", () => {
  test.describe.configure({ mode: "serial" });

  test("persists a document, file, workflow history, and lifecycle across browser refreshes", async ({ browser, request }) => {
    test.skip(
      requiredEnvironment.some((name) => !process.env[name]),
      `Set ${requiredEnvironment.join(", ")} to run against a real Release 1 backend.`,
    );

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const title = `E2E workflow ${suffix}`;
    const fileName = `E2E-${suffix}.pdf`;
    const returnReason = `E2E return reason ${suffix}`;
    const revisedDescription = `E2E revised document description ${suffix}, ready for approval.`;
    const category = await createCategoryFixture(request, suffix);
    const manager = await userByEmail(request, credentials("EMPLOYEE"), credentials("MANAGER").email);
    const employee = await login(browser, credentials("EMPLOYEE"));

    try {
      await employee.page.goto("/documents/create");
      await expect.poll(() => employee.page.locator("label:has-text('Подразделение') option").count()).toBeGreaterThan(0);
      await expect.poll(() => employee.page.locator("label:has-text('Ответственный') option").count()).toBeGreaterThan(0);
      await employee.page.getByLabel("Название").fill(title);
      await employee.page.locator("label:has-text('Категория') select").selectOption(category.id);
      await employee.page.getByLabel("Тип").fill("order");
      await employee.page.locator("label:has-text('Подразделение') select").selectOption({ index: 0 });
      await employee.page.locator("label:has-text('Ответственный') select").selectOption({ index: 0 });
      await employee.page.getByLabel("Дедлайн").fill(new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10));
      await employee.page.getByLabel("Описание").fill(`E2E initial document description ${suffix}.`);
      await employee.page.locator("label:has-text('Согласующие') select").selectOption(manager.id);
      await employee.page.locator("input[type='file']").setInputFiles({
        name: fileName,
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"),
      });
      await employee.page.getByRole("button", { name: "Сохранить черновик" }).click();
      await employee.page.waitForURL(/\/documents\/[0-9a-f-]{36}$/);
      console.info("E2E: draft created");

      const documentId = new URL(employee.page.url()).pathname.split("/").at(-1);
      expect(documentId).toBeTruthy();
      await expect(employee.page.getByRole("heading", { name: title })).toBeVisible();
      await employee.page.reload();
      await expect(employee.page.getByRole("heading", { name: title })).toBeVisible();
      await expect(employee.page.getByText("Черновик", { exact: true })).toBeVisible();

      await employee.page.getByRole("link", { name: "Редактировать" }).click();
      await employee.page.locator("label:has-text('Согласующие') select").selectOption(manager.id);
      await employee.page.getByRole("button", { name: "Сохранить и отправить" }).click();
      await employee.page.waitForURL(new RegExp(`/documents/${documentId}$`));
      await expect(employee.page.getByText("На согласовании", { exact: true })).toBeVisible();
      console.info("E2E: draft submitted");

      console.info("E2E: manager login starts");
      const managerSession = await login(browser, credentials("MANAGER"));
      try {
        console.info("E2E: manager login complete");
        await managerSession.page.goto("/documents/approval");
        console.info("E2E: manager approval scope opened");
        await expect(managerSession.page.getByRole("heading", { name: "На согласовании" })).toBeVisible();
        await managerSession.page.goto(`/documents/${documentId}`);
        await managerSession.page.getByRole("button", { name: "Вернуть", exact: true }).click();
        await expect(managerSession.page.getByRole("heading", { name: "Вернуть документ" })).toBeVisible();
        await managerSession.page.locator(".modal textarea").fill(returnReason);
        await managerSession.page.locator("form.modal").getByRole("button", { name: "Вернуть", exact: true }).click();
        await expect(managerSession.page.getByText("Возвращен", { exact: true })).toBeVisible();
        console.info("E2E: manager returned");
      } finally {
        await managerSession.context.close();
      }

      await employee.page.goto("/documents/returned");
      await expect(employee.page.getByRole("heading", { name: "Возвращённые" })).toBeVisible();
      await employee.page.goto(`/documents/${documentId}/edit`);
      await employee.page.getByLabel("Описание").fill(revisedDescription);
      await employee.page.locator("label:has-text('Согласующие') select").selectOption(manager.id);
      await employee.page.getByRole("button", { name: "Сохранить и отправить" }).click();
      await employee.page.waitForURL(new RegExp(`/documents/${documentId}$`));
      await expect(employee.page.getByText("На согласовании", { exact: true })).toBeVisible();
      console.info("E2E: employee resubmitted");

      const approvingManager = await login(browser, credentials("MANAGER"));
      try {
        await approvingManager.page.goto(`/documents/${documentId}`);
        await confirmAction(approvingManager.page, /Согласовать/);
        await expect(approvingManager.page.getByText("Согласован", { exact: true })).toBeVisible();
        console.info("E2E: manager approved");
      } finally {
        await approvingManager.context.close();
      }

      const office = await login(browser, credentials("OFFICE"));
      try {
        await office.page.goto(`/documents/${documentId}`);
        await confirmAction(office.page, /Зарегистрировать/);
        await expect(office.page.getByText("Согласован", { exact: true })).toBeVisible();
        console.info("E2E: office registered");
        await confirmAction(office.page, /Завершить/);
        await expect(office.page.getByText("Завершен", { exact: true })).toBeVisible();
        console.info("E2E: office completed");
        await confirmAction(office.page, /Архивировать/);
        await expect(office.page.getByText("Архив", { exact: true })).toBeVisible();
        console.info("E2E: office archived");

        await office.page.reload();
        await office.page.getByRole("button", { name: "Файлы" }).click();
        await expect(office.page.getByText(fileName, { exact: true })).toBeVisible();
        await office.page.getByRole("button", { name: "История" }).click();
        await expect(office.page.getByText(/Документ архивирован/)).toBeVisible();
      } finally {
        await office.context.close();
      }

      const admin = await login(browser, credentials("ADMIN"));
      try {
        await admin.page.goto(`/documents/${documentId}`);
        await confirmAction(admin.page, /Восстановить/);
        await expect(admin.page.getByText("Завершен", { exact: true })).toBeVisible();
        console.info("E2E: admin restored");
        await admin.page.reload();
        await admin.page.getByRole("button", { name: "История" }).click();
        await expect(admin.page.getByText(/Документ восстановлен/)).toBeVisible();
      } finally {
        await admin.context.close();
      }
    } finally {
      await employee.context.close();
    }
  });
});
