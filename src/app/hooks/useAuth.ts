// src/app/hooks/useAuth.ts
import { useState, useEffect } from "react";
import type { User, Language } from "../../shared/types/domain";

export function useAuth(
  lang: Language,
  setLang: (lang: Language) => void,
  setToast: (toast: any) => void
) {
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("darts_user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      if (u.language) setLang(u.language);
    }

    const storedRegUsers = localStorage.getItem("darts_registered_users");
    if (storedRegUsers) {
      setRegisteredUsers(JSON.parse(storedRegUsers));
    } else if (storedUser) {
      setRegisteredUsers([JSON.parse(storedUser)]);
    }
  }, []);

  const saveRegisteredUsers = (users: User[]) => {
    setRegisteredUsers(users);
    localStorage.setItem("darts_registered_users", JSON.stringify(users));
  };

  const login = (role: "user" | "admin", provider: "google" | "email") => {
    const mockId = role === "admin" ? "admin_001" : `user_${Date.now()}`;
    const mockUser: User = {
      id: mockId,
      name:
        role === "admin"
          ? "Manager"
          : provider === "google"
          ? "Alex Dartman"
          : "Goran Player",
      email: role === "admin" ? "admin@trainpikado.com" : "player@example.com",
      role: role,
      language: lang,
      avatar:
        role === "admin"
          ? "https://ui-avatars.com/api/?name=Admin&background=7c3aed&color=fff"
          : `https://api.dicebear.com/9.x/avataaars/svg?seed=${Date.now()}`,
    };

    const existingUser = registeredUsers.find((u) => u.email === mockUser.email);
    if (existingUser && existingUser.blocked) {
      setToast({
        show: true,
        msg: "Access Denied",
        desc: "Your account has been blocked.",
        variant: "error",
      });
      return false;
    }

    if (!existingUser) {
      saveRegisteredUsers([...registeredUsers, mockUser]);
    } else {
      mockUser.id = existingUser.id;
      mockUser.name = existingUser.name;
      mockUser.avatar = existingUser.avatar;
      if (existingUser.language) {
        mockUser.language = existingUser.language;
        setLang(existingUser.language);
      }
    }

    setUser(mockUser);
    localStorage.setItem("darts_user", JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("darts_user");
    setLang("hr");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    const updatedList = registeredUsers.map((u) =>
      u.id === updatedUser.id ? updatedUser : u
    );
    saveRegisteredUsers(updatedList);
    localStorage.setItem("darts_user", JSON.stringify(updatedUser));
  };

  return {
    user,
    registeredUsers,
    login,
    logout,
    updateUser,
    saveRegisteredUsers,
  };
}
