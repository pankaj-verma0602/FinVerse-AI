"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  collection, 
  setDoc, 
  doc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "@/firebase/config";
import {
  Users,
  Search,
  Check,
  Shield,
  User
} from "lucide-react";

interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real-time users list
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const docsList: UserDoc[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        docsList.push({
          id: docSnap.id,
          name: data.name || docSnap.id.substring(0, 6),
          email: data.email || "",
          role: data.role || "user",
          createdAt: data.createdAt || ""
        } as UserDoc);
      });
      setUsers(docsList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const triggerAlert = (text: string) => {
    setAlertMsg(text);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleUpdateRole = async (userId: string, currentRole: "admin" | "user") => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;

    try {
      await setDoc(doc(db, "users", userId), {
        role: nextRole
      }, { merge: true });
      triggerAlert("User role updated successfully!");
    } catch (err) {
      console.error(err);
      triggerAlert("Failed to update user role.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-border/20 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          User Management <Users className="h-6 w-6 text-primary" />
        </h1>
        <p className="text-muted-foreground text-sm">
          Inspect registered user profiles, search, filter, and assign/revert administrator roles.
        </p>
      </div>

      {alertMsg && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary animate-pulse">
          {alertMsg}
        </div>
      )}

      {/* Search Header */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 rounded-xl"
        />
      </div>

      {/* Users Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-12 border border-dashed border-border/40 rounded-xl col-span-3">
            No users matched your query.
          </div>
        ) : (
          filteredUsers.map((u) => (
            <Card key={u.id} className="glass-card border border-border/50 p-5 rounded-xl flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {u.role === "admin" ? (
                      <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                        <Shield className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs uppercase text-muted-foreground">User ID: {u.id.substring(0, 8)}</h4>
                      <h3 className="font-bold text-sm mt-0.5">{u.name}</h3>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                    u.role === "admin" 
                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                      : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  }`}>
                    {u.role}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate font-mono bg-muted/10 p-2 rounded border border-border/20">
                  {u.email}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/20">
                <span className="text-[10px] text-muted-foreground">
                  Registered: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                </span>
                <Button
                  onClick={() => handleUpdateRole(u.id, u.role)}
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-8 border-border text-primary hover:bg-primary/10 rounded-xl"
                >
                  Toggle Admin Role
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
