import { HTMLAttributes } from "react";

export default function InputError({
  message,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
  return message ? (
    <p {...props} className={"text-sm text-red-600 font-semibold " + className}>
      {message}
    </p>
  ) : null;
}
