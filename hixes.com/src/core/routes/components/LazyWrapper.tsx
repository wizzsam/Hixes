import { Suspense } from "react";
import { Loader } from "../../../components/ui/Loader";

export const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>
    {children}
  </Suspense>
);