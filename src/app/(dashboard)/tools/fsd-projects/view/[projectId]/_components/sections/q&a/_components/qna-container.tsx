"use client";

import {
  QnaCreateAction,
  QnaCreateActionProps,
} from "@/actions/tools/fsd-projects/qna/qna-create";
import { QnaDeleteAction } from "@/actions/tools/fsd-projects/qna/qna-delete";
import { QnaUpdateAction } from "@/actions/tools/fsd-projects/qna/qna-edit";
import { cn } from "@/lib/utils";
import { ProjectQna } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface QAItem {
  id: string;
  question: string;
  answer: string;
}

interface Props {
  projectId: string;
}

interface ApiProps {
  success: boolean;
  data: ProjectQna[];
}
export default function QNAContainer({ projectId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({ question: "", answer: "" });
  const [pending, startTransition] = useTransition();

  const queryClient = useQueryClient();

  const {
    data: apiData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<ApiProps>({
    queryKey: ["qna", projectId],
    queryFn: async () => {
      const res = await fetch(
        `/api/tools/fsd-project/qna?projectId=${projectId}`,
      );
      const data = await res.json();
      return data;
    },
  });

  const handleEdit = (item: QAItem) => {
    setEditingId(item.id);
    setEditForm({ question: item.question, answer: item.answer });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm.question.trim()) return;

    // 1️⃣ Snapshot previous cache (for rollback)
    const previousData = queryClient.getQueryData<ApiProps>(["qna", projectId]);

    // 2️⃣ Optimistic UI update (replace the edited item)
    queryClient.setQueryData<ApiProps>(["qna", projectId], (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        data: oldData.data.map((item) =>
          item.id === id
            ? {
                ...item,
                question: editForm.question,
                answer: editForm.answer,
                updatedAt: new Date(), // optional
              }
            : item,
        ),
      };
    });

    setEditingId(null);

    // 3️⃣ Server request
    startTransition(() => {
      QnaUpdateAction({
        id,
        question: editForm.question,
        answer: editForm.answer,
      }).then((res) => {
        if (!res.success) {
          // 4️⃣ Rollback on failure
          queryClient.setQueryData(["qna", projectId], previousData);
          toast.error(res.message);
          return;
        }

        // 5️⃣ Sync with server response (optional but best)
        queryClient.setQueryData<ApiProps>(["qna", projectId], (oldData) => {
          if (!oldData || !res.data) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((item) =>
              item.id === id ? res.data : item,
            ),
          };
        });

        toast.success("Q&A updated successfully");
      });
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ question: "", answer: "" });
  };

  const handleDelete = (id: string) => {
    // 1️⃣ Snapshot previous cache
    const previousData = queryClient.getQueryData<ApiProps>(["qna", projectId]);

    // 2️⃣ Optimistic UI update (remove the item)
    queryClient.setQueryData<ApiProps>(["qna", projectId], (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        data: oldData.data.filter((item) => item.id !== id),
      };
    });

    startTransition(() => {
      QnaDeleteAction({ id }).then((res) => {
        if (!res.success) {
          // 4️⃣ Rollback on failure
          queryClient.setQueryData(["qna", projectId], previousData);
          toast.error(res.message);
          return;
        }

        toast.success("Q&A deleted successfully");
      });
    });
  };

  const handleAddNew = () => {
    if (!newForm.question.trim()) return;

    const newItem: QnaCreateActionProps = {
      question: newForm.question,
      answer: newForm.answer,
      projectId,
    };

    // 1️⃣ Snapshot previous cache
    const previousData = queryClient.getQueryData<ApiProps>(["qna", projectId]);

    // generate temp id for optimistic item
    const tempId = Math.random().toString(36).substring(2, 15);

    // 2️⃣ Optimistic UI update
    queryClient.setQueryData<ApiProps>(["qna", projectId], (oldData) => {
      if (!oldData) return oldData;

      const optimisticItem = {
        ...newItem,
        id: tempId,
        creatorId: "optimistic",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        ...oldData,
        data: [optimisticItem, ...oldData.data],
      };
    });

    startTransition(() => {
      QnaCreateAction(newItem)
        .then((res) => {
          if (!res.success) {
            throw new Error(res.message);
          }

          // 3️⃣ Success → optionally refetch or replace optimistic item
          queryClient.invalidateQueries({ queryKey: ["qna", projectId] });

          setNewForm({ question: "", answer: "" });
          setIsAdding(false);
        })
        .catch((err) => {
          // 4️⃣ Rollback cache on failure
          queryClient.setQueryData(["qna", projectId], previousData);
          toast.error(err.message || "Failed to add Q&A");
        });
    });
  };

  let content;

  if (isLoading) {
    content = <LoadingState />;
  } else if (isError) {
    content = <ErrorState onRetry={refetch} isRefetching={isRefetching} />;
  } else if (apiData?.data.length === 0) {
    content = (
      <div>
        {/* Add New */}
        {isAdding ? (
          <div className="rounded-md bg-[#F7F6F3] p-3">
            <input
              type="text"
              value={newForm.question}
              onChange={(e) =>
                setNewForm({ ...newForm, question: e.target.value })
              }
              className="mb-2 w-full bg-transparent text-[15px] font-medium text-[#37352F] outline-none placeholder:text-[#9B9A97]"
              placeholder="Question"
              autoFocus
            />
            <textarea
              value={newForm.answer}
              onChange={(e) =>
                setNewForm({ ...newForm, answer: e.target.value })
              }
              className="w-full resize-none bg-transparent text-[14px] text-[#6B6B6B] outline-none placeholder:text-[#9B9A97]"
              placeholder="Answer (optional)"
              rows={2}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleAddNew}
                className="rounded px-2 py-1 text-xs font-medium text-[#37352F] hover:bg-[#EDECE9]"
                disabled={pending}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewForm({ question: "", answer: "" });
                }}
                className="rounded px-2 py-1 text-xs text-[#9B9A97] hover:bg-[#EDECE9]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <EmptyState onAddNew={() => setIsAdding(true)} />
        )}
      </div>
    );
  } else if (apiData && apiData?.data.length > 0) {
    content = (
      <div className="space-y-0.5">
        {apiData.data.map((item) => (
          <div key={item.id} className="group">
            {editingId === item.id ? (
              <div className="rounded-md bg-[#F7F6F3] p-3">
                <input
                  type="text"
                  value={editForm.question}
                  onChange={(e) =>
                    setEditForm({ ...editForm, question: e.target.value })
                  }
                  className="mb-2 w-full bg-transparent text-[15px] font-medium text-[#37352F] outline-none placeholder:text-[#9B9A97]"
                  placeholder="Question"
                  autoFocus
                />
                <textarea
                  value={editForm.answer}
                  onChange={(e) =>
                    setEditForm({ ...editForm, answer: e.target.value })
                  }
                  className="w-full resize-none bg-transparent text-[14px] text-[#6B6B6B] outline-none placeholder:text-[#9B9A97]"
                  placeholder="Answer (optional)"
                  rows={2}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(item.id)}
                    className="rounded px-2 py-1 text-xs font-medium text-[#37352F] hover:bg-[#EDECE9]"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="rounded px-2 py-1 text-xs text-[#9B9A97] hover:bg-[#EDECE9]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-1 rounded-md px-1 py-2 transition-colors hover:bg-[#F7F6F3]">
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="p-0.5 text-[#C4C4C4] hover:text-[#9B9A97]">
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-[#37352F]">
                    {item.question}
                  </p>
                  {item.answer && (
                    <p className="mt-0.5 text-[14px] text-[#6B6B6B]">
                      {item.answer}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="rounded p-1.5 text-[#9B9A97] hover:bg-[#EDECE9] hover:text-[#37352F]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded p-1.5 text-[#9B9A97] hover:bg-[#EDECE9] hover:text-[#EB5757]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add New */}
        {isAdding ? (
          <div className="rounded-md bg-[#F7F6F3] p-3">
            <input
              type="text"
              value={newForm.question}
              onChange={(e) =>
                setNewForm({ ...newForm, question: e.target.value })
              }
              className="mb-2 w-full bg-transparent text-[15px] font-medium text-[#37352F] outline-none placeholder:text-[#9B9A97]"
              placeholder="Question"
              autoFocus
            />
            <textarea
              value={newForm.answer}
              onChange={(e) =>
                setNewForm({ ...newForm, answer: e.target.value })
              }
              className="w-full resize-none bg-transparent text-[14px] text-[#6B6B6B] outline-none placeholder:text-[#9B9A97]"
              placeholder="Answer (optional)"
              rows={2}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleAddNew}
                className="rounded px-2 py-1 text-xs font-medium text-[#37352F] hover:bg-[#EDECE9]"
                disabled={pending}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewForm({ question: "", answer: "" });
                }}
                className="rounded px-2 py-1 text-xs text-[#9B9A97] hover:bg-[#EDECE9]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-[14px] text-[#9B9A97] transition-colors hover:bg-[#F7F6F3] hover:text-[#37352F]"
          >
            <Plus className="h-4 w-4" />
            <span>Add a question</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className=" bg-[#FBFBFA]">
      <div className="mx-auto px-8 py-5">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-[#37352F]">
            Q&A - Common Information
          </h1>
          <p className="mt-1 text-sm text-[#9B9A97]">
            Store and manage all your project related questions and answers in
            one place.
          </p>
        </div>

        {content}

        {/* Q&A List */}
      </div>
    </div>
  );
}

function ErrorState({
  onRetry,
  isRefetching,
}: {
  onRetry: () => void;
  isRefetching: boolean;
}) {
  return (
    <div className="flex flex-col items-center py-16">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDEBEB]">
        <AlertCircle className="h-6 w-6 text-[#EB5757]" />
      </div>
      <p className="mb-1 text-[15px] font-medium text-[#37352F]">
        Something went wrong
      </p>
      <p className="mb-4 text-center text-[14px] text-[#9B9A97]">
        We couldn&apos;t load your questions. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-md bg-[#37352F] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2F2F2F]"
      >
        <RefreshCw
          className={cn(isRefetching && "animate-spin", "h-3.5 w-3.5")}
        />
        Try again
      </button>
    </div>
  );
}

// Skeleton loader component
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-[#E9E9E7] ${className || ""}`} />
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="space-y-0.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-2 px-2 py-3">
          <Skeleton className="h-4 w-4 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State Component
function EmptyState({ onAddNew }: { onAddNew: () => void }) {
  return (
    <div className="flex flex-col items-center py-16">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F6F3]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-[#9B9A97]"
        >
          <path
            d="M9 9h6m-6 4h6m-6 4h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mb-1 text-[15px] font-medium text-[#37352F]">
        No questions yet
      </p>
      <p className="mb-4 text-center text-[14px] text-[#9B9A97]">
        Add your first question to get started.
      </p>
      <button
        onClick={onAddNew}
        className="flex items-center gap-2 rounded-md bg-[#37352F] px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#2F2F2F]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add question
      </button>
    </div>
  );
}
