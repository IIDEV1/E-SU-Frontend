import type { ReactNode } from "react";
import { ModalShell } from "./AdminUi";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  return <ModalShell isOpen={isOpen} onClose={onClose} title={title} className={className}>{children}</ModalShell>;
}
