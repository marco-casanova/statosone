"use client";

import React, { useState, useEffect } from "react";
import { Client, CareCategory, Task, TaskFormData } from "@/types/kinrelay";

interface TaskManagerProps {
  clientId: string;
  userRole: "family" | "specialist" | "nurse" | "caregiver";
}

export default function TaskManager({ clientId, userRole }: TaskManagerProps) {
  const [categories, setCategories] = useState<CareCategory[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CareCategory | null>(
    null
  );
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchTasks();
  }, [clientId, selectedDate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        "/api/care-categories?include_subcategories=true"
      );
      const result = await response.json();
      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/tasks?client_id=${clientId}&date=${selectedDate}`
      );
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: CareCategory) => {
    if (expandedCategory === category.id) {
      setExpandedCategory(null);
      setSelectedCategory(null);
    } else {
      setExpandedCategory(category.id);
      setSelectedCategory(category);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, ...updates }),
      });

      const result = await response.json();
      if (result.success) {
        // Refresh tasks
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleCreateTask = async (
    categoryId: string,
    subcategoryId?: string
  ) => {
    try {
      const taskData: TaskFormData = {
        client_id: clientId,
        category_id: categoryId,
        subcategory_id: subcategoryId,
        task_date: selectedDate,
        status: "pending",
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const result = await response.json();
      if (result.success) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const getCategoryTasks = (categoryId: string) => {
    return tasks.filter((task) => task.category_id === categoryId);
  };

  const isSpecialist = ["specialist", "nurse", "caregiver"].includes(userRole);

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <h2>TAREAS</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
      </div>

      <div className="categories-list">
        {categories.map((category) => {
          const categoryTasks = getCategoryTasks(category.id);
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="category-item">
              <button
                className="category-button"
                onClick={() => handleCategoryClick(category)}
                style={{
                  backgroundColor: isExpanded ? category.color : "#E0F2F1",
                  borderLeft: `4px solid ${category.color}`,
                }}
              >
                <span className="category-name">{category.name_es}</span>
                {categoryTasks.length > 0 && (
                  <span className="task-count">{categoryTasks.length}</span>
                )}
                <span className="expand-icon">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {isExpanded && (
                <div className="category-details">
                  {category.subcategories &&
                  category.subcategories.length > 0 ? (
                    <div className="subcategories">
                      {category.subcategories.map((subcategory) => {
                        const subcategoryTasks = categoryTasks.filter(
                          (t) => t.subcategory_id === subcategory.id
                        );

                        return (
                          <div
                            key={subcategory.id}
                            className="subcategory-item"
                          >
                            <div className="subcategory-header">
                              <span>{subcategory.name_es}</span>
                              {subcategory.unit && (
                                <span className="unit">
                                  ({subcategory.unit})
                                </span>
                              )}
                            </div>

                            {subcategoryTasks.map((task) => (
                              <TaskItem
                                key={task.id}
                                task={task}
                                subcategory={subcategory}
                                onUpdate={handleTaskUpdate}
                                isSpecialist={isSpecialist}
                              />
                            ))}

                            {isSpecialist && subcategoryTasks.length === 0 && (
                              <button
                                className="add-task-btn"
                                onClick={() =>
                                  handleCreateTask(category.id, subcategory.id)
                                }
                              >
                                + Agregar
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-subcategories">
                      {categoryTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onUpdate={handleTaskUpdate}
                          isSpecialist={isSpecialist}
                        />
                      ))}
                      {isSpecialist && (
                        <button
                          className="add-task-btn"
                          onClick={() => handleCreateTask(category.id)}
                        >
                          + Agregar Tarea
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .task-manager {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
          background: #b2dfdb;
          min-height: 100vh;
        }

        .task-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .task-manager-header h2 {
          font-size: 24px;
          font-weight: bold;
        }

        .date-picker {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .category-item {
          background: white;
          border-radius: 8px;
          overflow: hidden;
        }

        .category-button {
          width: 100%;
          padding: 16px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .category-button:hover {
          opacity: 0.9;
        }

        .category-name {
          flex: 1;
          text-align: left;
        }

        .task-count {
          background: #ff9800;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          margin: 0 8px;
        }

        .expand-icon {
          font-size: 12px;
        }

        .category-details {
          padding: 16px;
          background: #f5f5f5;
        }

        .subcategories {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .subcategory-item {
          background: white;
          padding: 12px;
          border-radius: 4px;
        }

        .subcategory-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-weight: 500;
        }

        .unit {
          color: #666;
          font-size: 14px;
        }

        .add-task-btn {
          width: 100%;
          padding: 10px;
          background: #ffd54f;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 8px;
        }

        .add-task-btn:hover {
          background: #ffc107;
        }
      `}</style>
    </div>
  );
}

interface TaskItemProps {
  task: Task;
  subcategory?: any;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  isSpecialist: boolean;
}

function TaskItem({
  task,
  subcategory,
  onUpdate,
  isSpecialist,
}: TaskItemProps) {
  const [value, setValue] = useState(task.value || {});
  const [description, setDescription] = useState(task.description || "");

  const handleComplete = () => {
    onUpdate(task.id, {
      status: task.status === "completed" ? "pending" : "completed",
      value,
      description,
    });
  };

  return (
    <div className="task-item">
      {subcategory?.input_type === "checkbox" && (
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={task.status === "completed"}
            onChange={handleComplete}
            disabled={!isSpecialist}
          />
          <span>{subcategory.name_es}</span>
        </label>
      )}

      {subcategory?.input_type === "number" && (
        <div className="number-input-group">
          <input
            type="number"
            value={value.amount || ""}
            onChange={(e) => setValue({ ...value, amount: e.target.value })}
            disabled={!isSpecialist}
            min={subcategory.options?.min}
            max={subcategory.options?.max}
            step={subcategory.options?.step}
          />
          {subcategory.unit && <span className="unit">{subcategory.unit}</span>}
        </div>
      )}

      {subcategory?.input_type === "select" && (
        <select
          value={value.selected || ""}
          onChange={(e) => setValue({ ...value, selected: e.target.value })}
          disabled={!isSpecialist}
        >
          <option value="">Seleccionar...</option>
          {subcategory.options?.options?.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {subcategory?.input_type === "time" && (
        <input
          type="time"
          value={value.time || ""}
          onChange={(e) => setValue({ ...value, time: e.target.value })}
          disabled={!isSpecialist}
        />
      )}

      <input
        type="text"
        placeholder="Descripción..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={!isSpecialist}
        className="description-input"
      />

      {isSpecialist && (
        <button className="save-btn" onClick={handleComplete}>
          GUARDAR
        </button>
      )}

      <style jsx>{`
        .task-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .number-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        input[type="number"],
        input[type="time"],
        input[type="text"],
        select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        .description-input {
          width: 100%;
        }

        .save-btn {
          background: #ffd54f;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-btn:hover {
          background: #ffc107;
        }
      `}</style>
    </div>
  );
}
