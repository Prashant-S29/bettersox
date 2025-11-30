import { useEffect, useState } from "react";
import { db } from "~/lib/storage";

export const usePledgeStatus = () => {
  const [pledgeSigned, setPledgeSigned] = useState(false);
  const [pledgeLoading, setPledgeLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setPledgeLoading(true);

        const pledgeStatus = await db.getPledgeStatus();
        setPledgeSigned(pledgeStatus?.signed ?? false);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setPledgeLoading(false);
      }
    };

    void loadData();
  }, []);

  return { pledgeSigned, pledgeLoading };
};
