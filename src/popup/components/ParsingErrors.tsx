import { AlertCircle } from "lucide-react";
import type { ParserError } from "@/types/parser";

interface ParsingErrorsProps {
  errors: ParserError[];
}

/**
 * Displays parsing errors for the Errors tab or inline. No upload or form logic.
 */
export function ParsingErrors({ errors }: ParsingErrorsProps): React.ReactElement {
  if (errors.length === 0) return <></>;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Parsing issues:
      </p>
      <ul className="space-y-1.5">
        {errors.map((e, i) => (
          <li
            key={`${e.code}-${i}`}
            className="flex items-start gap-2 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              <span className="font-medium">[{e.code}]</span> {e.message}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
