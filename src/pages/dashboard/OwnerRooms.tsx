import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Sun,
  Sunset,
  Moon,
  LayoutGrid,
  UserCircle,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import CreateRoomModal from "../../components/modals/CreateRoomModal";
import EditRoomModal from "../../components/modals/EditRoomModal";
import type { Consultory } from "../../types/consultory";
import type { Room } from "../../types/room";
import { useAuth } from "../../context/AuthContext";
import { listConsultoriesByOwner } from "../../lib/api/consultories";
import { listRoomsByConsultory, deleteRoom, updateRoom } from "../../lib/api/rooms";

const navItems = [
  {
    label: "Visão geral",
    path: "/dashboard/owner",
    icon: <Building2 size={18} />,
  },
  {
    label: "Minhas salas",
    path: "/dashboard/owner/rooms",
    icon: <LayoutGrid size={18} />,
  },
  {
    label: "Perfil do Consultório",
    path: "/dashboard/owner/profile",
    icon: <UserCircle size={18} />,
  },
];

export default function OwnerRooms() {
  const { currentUser } = useAuth();
  const [consultories, setConsultories] = useState<Consultory[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [togglingRoomId, setTogglingRoomId] = useState<string | null>(null);

  useEffect(() => {
    const ownerId = currentUser?.id;
    if (!ownerId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        const consultoriesData = await listConsultoriesByOwner(ownerId!);
        if (cancelled) return;
        setConsultories(consultoriesData);

        if (consultoriesData.length > 0) {
          const allRooms = await Promise.all(
            consultoriesData.map((c) => listRoomsByConsultory(c.id))
          );
          if (!cancelled) setRooms(allRooms.flat());
        }

        if (!cancelled) setError("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Não foi possível carregar as salas."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const primaryConsultory = consultories[0];

  const handleToggleAvailability = async (room: Room) => {
    setTogglingRoomId(room.id);
    try {
      await updateRoom(room.id, { available: !room.available });
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, available: !r.available } : r))
      );
    } catch {
      // noop — keep UI stable
    } finally {
      setTogglingRoomId(null);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setDeletingRoomId(roomId);
    try {
      await deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setConfirmingDeleteId(null);
    } catch {
      // noop — keep UI stable
    } finally {
      setDeletingRoomId(null);
    }
  };

  const availableCount = rooms.filter((r) => r.available).length;

  return (
    <DashboardLayout
      navItems={navItems}
      title="Minhas Salas"
      titleClassName="!font-normal"
      profileOverride={
        primaryConsultory
          ? {
              name: primaryConsultory.name,
              avatarUrl: primaryConsultory.logoUrl,
              subtitle: "Proprietário",
            }
          : undefined
      }
    >
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-neutral-600 text-base sm:text-lg font-medium">
              Gerencie as salas do seu consultório.
            </p>
          </div>
          {primaryConsultory && currentUser && (
            <button
              onClick={() => setShowCreateRoom(true)}
              className="flex items-center gap-2 bg-primary-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-primary-600 transition-colors shrink-0"
            >
              <Plus size={16} />
              Adicionar sala
            </button>
          )}
        </div>

        {/* Stats strip */}
        {rooms.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-[0_4px_24px_rgba(0,102,204,0.08)]">
              <p className="text-xs text-neutral-400 mb-1">Total de salas</p>
              <p className="font-display font-bold text-xl text-neutral-900">{rooms.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-[0_4px_24px_rgba(0,102,204,0.08)]">
              <p className="text-xs text-neutral-400 mb-1">Disponíveis</p>
              <p className="font-display font-bold text-xl text-green-600">{availableCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-[0_4px_24px_rgba(0,102,204,0.08)]">
              <p className="text-xs text-neutral-400 mb-1">Indisponíveis</p>
              <p className="font-display font-bold text-xl text-neutral-500">
                {rooms.length - availableCount}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Room list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary-300" />
          </div>
        ) : rooms.length === 0 ? (
          <EmptyRooms
            hasConsultory={Boolean(primaryConsultory)}
            onAdd={() => setShowCreateRoom(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isTogglingAvailability={togglingRoomId === room.id}
                isDeleting={deletingRoomId === room.id}
                isConfirmingDelete={confirmingDeleteId === room.id}
                onEdit={() => setEditingRoom(room)}
                onToggleAvailability={() => void handleToggleAvailability(room)}
                onDeleteRequest={() => setConfirmingDeleteId(room.id)}
                onDeleteCancel={() => setConfirmingDeleteId(null)}
                onDeleteConfirm={() => void handleDeleteRoom(room.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateRoom && primaryConsultory && currentUser && (
        <CreateRoomModal
          consultoryId={primaryConsultory.id}
          ownerId={currentUser.id}
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setRooms((prev) => [...prev, room]);
            setShowCreateRoom(false);
          }}
        />
      )}

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onUpdated={(updatedRoom) => {
            setRooms((prev) =>
              prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r))
            );
            setEditingRoom(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}

interface RoomCardProps {
  room: Room;
  isTogglingAvailability: boolean;
  isDeleting: boolean;
  isConfirmingDelete: boolean;
  onEdit: () => void;
  onToggleAvailability: () => void;
  onDeleteRequest: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}

function RoomCard({
  room,
  isTogglingAvailability,
  isDeleting,
  isConfirmingDelete,
  onEdit,
  onToggleAvailability,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.08)] overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-40 bg-neutral-100 shrink-0">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium border ${
            room.available
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-white/80 text-neutral-500 border-neutral-200"
          }`}
        >
          {room.available ? "Disponível" : "Indisponível"}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-display font-bold text-neutral-800 leading-snug">{room.name}</h3>
          <p className="font-display font-bold text-primary-500 shrink-0 text-sm">
            R$ {room.pricePerPeriod}/período
          </p>
        </div>

        {room.description && (
          <p className="text-sm text-neutral-500 mb-3 line-clamp-2 leading-relaxed">
            {room.description}
          </p>
        )}

        {/* Periods */}
        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
          {room.periods.morning && (
            <span className="flex items-center gap-1">
              <Sun size={12} className="text-accent-400" />
              Manhã
            </span>
          )}
          {room.periods.afternoon && (
            <span className="flex items-center gap-1">
              <Sunset size={12} className="text-accent-400" />
              Tarde
            </span>
          )}
          {room.periods.evening && (
            <span className="flex items-center gap-1">
              <Moon size={12} className="text-primary-400" />
              Noite
            </span>
          )}
        </div>

        {/* Equipment */}
        {room.equipment.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {room.equipment.slice(0, 3).map((eq) => (
              <span
                key={eq}
                className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full"
              >
                {eq}
              </span>
            ))}
            {room.equipment.length > 3 && (
              <span className="text-xs text-neutral-400">+{room.equipment.length - 3}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <p className="text-sm text-red-600 flex-1 font-medium">Apagar esta sala?</p>
              <button
                onClick={onDeleteCancel}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onDeleteConfirm}
                disabled={isDeleting}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center gap-1"
              >
                {isDeleting && <Loader2 size={12} className="animate-spin" />}
                Apagar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleAvailability}
                disabled={isTogglingAvailability}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                  room.available
                    ? "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    : "border-green-200 text-green-600 bg-green-50 hover:bg-green-100"
                }`}
              >
                {isTogglingAvailability ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : room.available ? (
                  <XCircle size={13} />
                ) : (
                  <CheckCircle2 size={13} />
                )}
                {room.available ? "Desativar" : "Ativar"}
              </button>
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <Edit3 size={13} />
                Editar
              </button>
              <button
                onClick={onDeleteRequest}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors ml-auto"
              >
                <Trash2 size={13} />
                Apagar
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyRooms({
  hasConsultory,
  onAdd,
}: {
  hasConsultory: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,102,204,0.06)] p-14 text-center">
      <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <LayoutGrid size={28} className="text-primary-300" />
      </div>
      <h3 className="font-display font-semibold text-neutral-700 mb-2">Nenhuma sala cadastrada</h3>
      <p className="text-sm text-neutral-400 mb-6 max-w-xs mx-auto">
        {hasConsultory
          ? "Adicione salas ao seu consultório para começar a receber reservas."
          : "Você precisa ter um consultório cadastrado antes de adicionar salas."}
      </p>
      {hasConsultory && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 bg-primary-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          Adicionar primeira sala
        </button>
      )}
    </div>
  );
}
