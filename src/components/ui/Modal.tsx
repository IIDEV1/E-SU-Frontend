import type { ReactNode } from "react";
import { ModalShell } from "./AdminUi";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return <ModalShell isOpen={isOpen} onClose={onClose} title={title}>{children}</ModalShell>;
}
