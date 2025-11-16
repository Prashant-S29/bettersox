"use client";

import { useEffect, useState } from "react";

export const useMount = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
