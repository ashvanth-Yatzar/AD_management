import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { AdvertisementListPage } from "@/features/advertisements/pages/AdvertisementListPage";
import { AdvertisementCreatePage } from "@/features/advertisements/pages/AdvertisementCreatePage";
import { AdvertisementEditPage } from "@/features/advertisements/pages/AdvertisementEditPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/advertisements" replace />} />
          <Route path="advertisements" element={<AdvertisementListPage />} />
          <Route path="advertisements/create" element={<AdvertisementCreatePage />} />
          <Route path="advertisements/:id/edit" element={<AdvertisementEditPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
