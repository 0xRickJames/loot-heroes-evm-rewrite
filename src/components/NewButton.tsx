import React, { ButtonHTMLAttributes } from "react"

interface NewButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "small" | "medium" | "large"
}

export function NewButton({
  size = "medium",
  children,
  ...restProps
}: NewButtonProps) {
  return (
    <button className={size} {...restProps}>
      {children}

      <style jsx>{`
        button.large {
          padding: 10px 30px;
          font-size: 36px;
        }
        button.medium {
          padding: 8px 24px;
          font-size: 24px;
        }
        button.small {
          padding: 6px 18px;
          font-size: 16px;
        }

        button:hover,
        button:focus,
        button:active,
        button:visited {
          box-shadow: 0px 0px 8px 0px #21212b inset !important;
          background: #3c3c3c;
        }

        button {
          display: flex;
          align-items: center;
          gap: 10px;
          align-self: stretch;

          border: 1px solid #55575c;
          background: rgba(60, 60, 60, 0.8);
          box-shadow: 0px 0px 8px 0px #3f3f4d inset !important;

          color: #fff;
          font-family: Carta-Marina;
          font-style: normal;
          font-weight: 400;
          line-height: normal;
        }
      `}</style>
    </button>
  )
}
