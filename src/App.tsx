import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth/AuthContext'
import { AdminRoute, SuperAdminRoute, MemberRoute, ControleurRoute, FullscreenLoader, roleHome } from '@/routes/guards'
import { AdminLayout } from '@/layouts/AdminLayout'
import { MemberLayout } from '@/layouts/MemberLayout'
import { ControleurLayout } from '@/layouts/ControleurLayout'
import Login from '@/pages/Login'

import Dashboard from '@/pages/admin/Dashboard'
import Membres from '@/pages/admin/Membres'
import Controleurs from '@/pages/admin/Controleurs'
import AdminEvenements from '@/pages/admin/Evenements'
import AdminFormations from '@/pages/admin/Formations'
import CertificatsKits from '@/pages/admin/CertificatsKits'
import Kits from '@/pages/admin/Kits'
import AdminActionsSociales from '@/pages/admin/ActionsSociales'
import SuiviPostFormation from '@/pages/admin/SuiviPostFormation'
import Journal from '@/pages/admin/Journal'
import RapportControleAcces from '@/pages/admin/RapportControleAcces'
import ControleAcces from '@/pages/admin/ControleAcces'
import Admins from '@/pages/admin/Admins'
import Parametres from '@/pages/admin/Parametres'
import AdminNotifications from '@/pages/admin/Notifications'
import Annuaire from '@/pages/Annuaire'
import Gouvernance from '@/pages/Gouvernance'

import MaCarte from '@/pages/membre/MaCarte'
import MonProfil from '@/pages/membre/MonProfil'
import MesFormations from '@/pages/membre/MesFormations'
import MesEvenements from '@/pages/membre/MesEvenements'
import MembreNotifications from '@/pages/membre/Notifications'
import Historique from '@/pages/membre/Historique'

import ControleurScan from '@/pages/controleur/Scan'
import ControleurHistorique from '@/pages/controleur/Historique'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <FullscreenLoader />
  return <Navigate to={roleHome(user)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="membres" element={<AdminRoute permission="GERER_MEMBRES"><Membres /></AdminRoute>} />
        <Route path="controleurs" element={<AdminRoute permission="GERER_CONTROLEURS"><Controleurs /></AdminRoute>} />
        <Route path="evenements" element={<AdminRoute permission="GERER_EVENEMENTS"><AdminEvenements /></AdminRoute>} />
        <Route path="formations" element={<AdminRoute permission="GERER_FORMATIONS"><AdminFormations /></AdminRoute>} />
        <Route path="certificats-kits" element={<AdminRoute permission="GERER_FORMATIONS"><CertificatsKits /></AdminRoute>} />
        <Route path="kits" element={<AdminRoute permission="GERER_FORMATIONS"><Kits /></AdminRoute>} />
        <Route
          path="actions-sociales"
          element={<AdminRoute permission="GERER_ACTIONS_SOCIALES"><AdminActionsSociales /></AdminRoute>}
        />
        <Route path="suivi" element={<AdminRoute permission="GERER_SUIVI"><SuiviPostFormation /></AdminRoute>} />
        <Route path="journal" element={<AdminRoute permission="VOIR_RAPPORTS"><Journal /></AdminRoute>} />
        <Route
          path="rapport-controle-acces"
          element={<AdminRoute permission="VOIR_RAPPORTS"><RapportControleAcces /></AdminRoute>}
        />
        <Route path="controle-acces" element={<ControleAcces />} />
        <Route path="admins" element={<SuperAdminRoute><Admins /></SuperAdminRoute>} />
        <Route path="parametres" element={<SuperAdminRoute><Parametres /></SuperAdminRoute>} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="annuaire" element={<Annuaire />} />
        <Route path="gouvernance" element={<Gouvernance />} />
      </Route>

      <Route
        path="/membre"
        element={
          <MemberRoute>
            <MemberLayout />
          </MemberRoute>
        }
      >
        <Route index element={<MaCarte />} />
        <Route path="profil" element={<MonProfil />} />
        <Route path="formations" element={<MesFormations />} />
        <Route path="evenements" element={<MesEvenements />} />
        <Route path="notifications" element={<MembreNotifications />} />
        <Route path="historique" element={<Historique />} />
        <Route path="annuaire" element={<Annuaire />} />
        <Route path="gouvernance" element={<Gouvernance />} />
      </Route>

      <Route
        path="/controleur"
        element={
          <ControleurRoute>
            <ControleurLayout />
          </ControleurRoute>
        }
      >
        <Route index element={<ControleurScan />} />
        <Route path="historique" element={<ControleurHistorique />} />
        <Route path="annuaire" element={<Annuaire />} />
        <Route path="gouvernance" element={<Gouvernance />} />
      </Route>

      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}
