declare module "react-world-flags" {
  import type { ComponentType, ImgHTMLAttributes, ReactNode } from "react";

  interface FlagProps extends ImgHTMLAttributes<HTMLImageElement> {
    code: string;
    fallback?: ReactNode;
  }

  const Flag: ComponentType<FlagProps>;
  export default Flag;
}
