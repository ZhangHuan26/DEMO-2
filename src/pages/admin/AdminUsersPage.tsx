import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldAlert, Lock, Unlock, History, ShieldCheck, UserX, X } from 'lucide-react';
import { User, FreezeLog } from '../../types';
import { adminApi } from '../../api/admin';
import { FreezeModal } from '../../components/common/FreezeModal';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Freeze Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);

  // Freeze Logs Modal State
  const [logsUser, setLogsUser] = useState<User | null>(null);
  const [freezeLogs, setFreezeLogs] = useState<FreezeLog[]>([]);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await adminApi.getUsers({ keyword: search || undefined });
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
    try {
      await adminApi.unfreezeUser(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 0 } : u));
    } catch {
      alert('解封操作失败');
    }
  };

  const handleToggleAdminRole = async (user: User) => {
    const isAdmin = user.role === 1 || (user.role as unknown) === 'admin' || (user.role as unknown) === '1';
    if (isAdmin) {
      try {
        await adminApi.revokeAdmin(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 0 } : u));
      } catch {
        alert('操作失败');
      }
    } else {
      try {
        await adminApi.grantAdmin({ userId: user.id });
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: 1 } : u));
      } catch {
        alert('操作失败');
      }
    }
  };

  const handleOpenLogs = async (user: User) => {
    setLogsUser(user);
    setIsLogsModalOpen(true);
    setLogsLoading(true);
    try {
      const logs = await adminApi.getFreezeLogs(user.id);
      setFreezeLogs(Array.isArray(logs) ? logs : []);
    } catch {
      setFreezeLogs([]);
    } finally {
      setLogsLoading(false);
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
                    {u.role === 1 || (u.role as unknown) === 'admin' || (u.role as unknown) === '1' ? (
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
                  <td className="px-6 py-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenLogs(u)}
                      title="查看封禁记录"
                      className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <History className="w-3.5 h-3.5" /> 日志
                    </button>

                    <button
                      onClick={() => handleToggleAdminRole(u)}
                      title={u.role === 1 ? "撤销管理员" : "提升为管理员"}
                      className={`px-2.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 ${
                        u.role === 1 || (u.role as unknown) === 'admin'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {u.role === 1 || (u.role as unknown) === 'admin' ? '撤权' : '设管理员'}
                    </button>

                    {u.status === 1 ? (
                      <button
                        onClick={() => handleUnfreeze(u)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        解封
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsFreezeModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        冻结
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Freeze Logs Modal */}
      {isLogsModalOpen && logsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-base">
                <History className="w-5 h-5 text-[#0057FF]" />
                用户 <span>{logsUser.nickName}</span> 的封禁操作历史
              </div>
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {logsLoading ? (
                <div className="text-center py-8 text-neutral-400 text-xs font-mono">正在加载日志记录...</div>
              ) : freezeLogs.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">该用户暂无违规封禁记录</div>
              ) : (
                freezeLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px] text-neutral-500">
                      <span>操作员 ID: #{log.adminId}</span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-neutral-800 font-medium">
                      <span className="font-bold text-rose-600">封禁原因：</span>
                      {log.reason}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsLogsModalOpen(false)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                关闭窗口
              </button>
            </div>
          </div>
        </div>
      )}

      <FreezeModal
        isOpen={isFreezeModalOpen}
        user={selectedUser}
        onClose={() => setIsFreezeModalOpen(false)}
        onSuccess={loadUsers}
      />
    </div>
  );
};
