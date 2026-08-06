import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldAlert, Lock, Unlock } from 'lucide-react';
import { User } from '../../types';
import { adminApi } from '../../api/admin';
import { FreezeModal } from '../../components/common/FreezeModal';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Freeze Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await adminApi.getUsers({ keyword: search || undefined });
      // 确保返回的是数组
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleUnfreeze = async (user: User) => {
    if (!confirm(`确认解除用户 "${user.nickName}" 的账号封禁状态？`)) return;
    try {
      await adminApi.unfreezeUser(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 0 } : u));
      alert('已成功解除封禁！');
    } catch {
      alert('解封操作失败');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0057FF]" /> 用户与封禁管理
          </h1>
          <p className="text-sm text-neutral-500 mt-1">支持精准检索全站用户，设置 1/3/7/30 天或永久封禁惩罚</p>
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索邮箱、昵称或用户 ID..."
            className="w-full bg-white border border-neutral-200 rounded-full pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#0057FF] shadow-2xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm text-neutral-800">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 text-xs font-bold font-mono">
            <tr>
              <th className="px-6 py-3.5">用户 ID</th>
              <th className="px-6 py-3.5">用户资料</th>
              <th className="px-6 py-3.5">系统角色</th>
              <th className="px-6 py-3.5">账号状态</th>
              <th className="px-6 py-3.5 text-right">管控操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">正在加载用户记录...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">未检索到匹配的用户</td></tr>
            ) : (
              users.map((u, idx) => (
                <tr key={`user-row-${u.id ?? idx}-${idx}`} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono text-neutral-500 text-xs">#{u.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.nickName} className="w-9 h-9 rounded-full object-cover border border-neutral-200 shadow-2xs" />
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">{u.nickName}</div>
                        <div className="text-xs text-neutral-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.role === 1 || u.role === 'admin' || u.role === '1' ? (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold">超级管理员</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-semibold">普通创作者</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.status === 1 ? (
                      <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <Lock className="w-3.5 h-3.5" /> 已封禁冻结
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                        <Unlock className="w-3.5 h-3.5" /> 正常使用
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {u.status === 1 ? (
                      <button
                        onClick={() => handleUnfreeze(u)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        解封账号
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsFreezeModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        冻结封禁
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FreezeModal
        isOpen={isFreezeModalOpen}
        user={selectedUser}
        onClose={() => setIsFreezeModalOpen(false)}
        onSuccess={loadUsers}
      />
    </div>
  );
};
