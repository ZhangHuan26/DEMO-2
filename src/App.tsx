import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserShell } from './components/user/UserShell';
import { AdminShell } from './pages/admin/AdminShell';
import { Toast } from './components/common/Toast';

// User Pages
import { HomePage } from './pages/user/HomePage';
import { ExplorePage } from './pages/user/ExplorePage';
import { VideosPage } from './pages/user/VideosPage';
import { FilesPage } from './pages/user/FilesPage';
import { FeedPage } from './pages/user/FeedPage';
import { CreatorsPage } from './pages/user/CreatorsPage';
import { SearchPage } from './pages/user/SearchPage';
import { ArticleDetailPage } from './pages/user/ArticleDetailPage';
import { VideoDetailPage } from './pages/user/VideoDetailPage';
import { FileDetailPage } from './pages/user/FileDetailPage';
import { UserProfilePage } from './pages/user/UserProfilePage';
import { MyProfilePage } from './pages/user/MyProfilePage';
import { DiscoverFriendsPage } from './pages/user/DiscoverFriendsPage';

import { CreatorDashboardPage } from './pages/user/CreatorDashboardPage';
import { NotificationsPage } from './pages/user/NotificationsPage';
import { SettingsPage } from './pages/user/SettingsPage';
import { MyFavoritesPage } from './pages/user/MyFavoritesPage';
import { MyFilesPage } from './pages/user/MyFilesPage';
import { MyWorksPage } from './pages/user/MyWorksPage';
import { MyAppealsPage } from './pages/user/MyAppealsPage';

// Admin Pages
import { AdminDashboardHome } from './pages/admin/AdminDashboardHome';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminArticlesPage } from './pages/admin/AdminArticlesPage';
import { AdminVideosPage } from './pages/admin/AdminVideosPage';
import { AdminFilesPage } from './pages/admin/AdminFilesPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAppealsPage } from './pages/admin/AdminAppealsPage';
import { AdminLogsPage } from './pages/admin/AdminLogsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

export function App() {
  return (
    <AuthProvider>
      <Toast />
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes wrapped in AdminShell */}
          <Route path="/admin" element={<AdminShell />}>
            <Route index element={<AdminDashboardHome />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="articles" element={<AdminArticlesPage />} />
            <Route path="videos" element={<AdminVideosPage />} />
            <Route path="files" element={<AdminFilesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="appeals" element={<AdminAppealsPage />} />
            <Route path="logs" element={<AdminLogsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* User Routes wrapped in UserShell */}
          <Route path="/" element={<UserShell />}>
            <Route index element={<ExplorePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="articles" element={<HomePage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="creators" element={<CreatorsPage />} />
            <Route path="search" element={<SearchPage />} />

            {/* Detail Pages */}
            <Route path="articles/:id" element={<ArticleDetailPage />} />
            <Route path="videos/:id" element={<VideoDetailPage />} />
            <Route path="files/:id" element={<FileDetailPage />} />

            {/* User Account & Center */}
            <Route path="users/:id" element={<UserProfilePage />} />
            <Route path="me/profile" element={<MyProfilePage />} />
            <Route path="me/works" element={<MyWorksPage />} />
            <Route path="discover-friends" element={<DiscoverFriendsPage />} />

            <Route path="creator" element={<CreatorDashboardPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="me/favorites" element={<MyFavoritesPage />} />
            <Route path="me/files" element={<MyFilesPage />} />
            <Route path="me/appeals" element={<MyAppealsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
