"use client";

import React, { useState, useEffect } from "react";
import { Plus, Shield, Trash2, Edit, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data until API is ready
interface Role {
    id: string;
    name: string;
    description: string;
    usersCount: number;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([
        { id: "1", name: "admin", description: "Administrator with full access", usersCount: 3 },
        { id: "2", name: "moderator", description: "Can moderate content and users", usersCount: 8 },
        { id: "3", name: "user", description: "Standard user access", usersCount: 1542 },
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRole, setNewRole] = useState({ name: "", description: "" });

    const handleCreateRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRole.name) return;

        const role: Role = {
            id: Math.random().toString(36).substr(2, 9),
            name: newRole.name,
            description: newRole.description,
            usersCount: 0
        };

        setRoles([...roles, role]);
        setNewRole({ name: "", description: "" });
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Роли и Доступы</h1>
                    <p className="text-muted-foreground mt-2">
                        Управление ролями пользователей и настройка прав доступа.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Создать роль
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="group relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={cn(
                                    "p-3 rounded-lg",
                                    role.name === "admin"
                                        ? "bg-destructive/10 text-destructive"
                                        : role.name === "moderator"
                                            ? "bg-warning/10 text-warning"
                                            : "bg-primary/10 text-primary"
                                )}
                            >
                                <Shield className="w-6 h-6" />
                            </div>
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold mb-2 capitalize">{role.name}</h3>
                        <p className="text-muted-foreground text-sm mb-6 h-10 line-clamp-2">
                            {role.description || "Нет описания"}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <span className="text-sm text-muted-foreground">Пользователей</span>
                            <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full">
                                {role.usersCount}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Card used for adding new role visually as well */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex flex-col items-center justify-center bg-card border border-dashed border-border rounded-xl p-6 hover:border-primary/50 hover:bg-secondary/50 transition-all duration-300 group min-h-[200px]"
                >
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-muted-foreground group-hover:text-foreground">Добавить новую роль</span>
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-xl shadow-2xl border border-border p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">Новая роль</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRole} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Название роли
                                </label>
                                <input
                                    type="text"
                                    value={newRole.name}
                                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    placeholder="например, manager"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Описание
                                </label>
                                <textarea
                                    value={newRole.description}
                                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                    className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all min-h-[100px]"
                                    placeholder="Краткое описание прав доступа..."
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    Создать
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
