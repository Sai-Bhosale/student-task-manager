const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

// Test database connection
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ PostgreSQL connected successfully!");
  }
});

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Student Task Manager API is running!"
  });
});

// ==================== USERS CRUD ====================

// CREATE USER
app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Server-side validation
    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required"
      });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    res.status(500).json({
      error: "Failed to create user"
    });
  }
});


// READ ALL USERS
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id"
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch users"
    });
  }
});


// READ ONE USER
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch user"
    });
  }
});


// UPDATE USER
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Server-side validation
    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required"
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2
       WHERE id = $3
       RETURNING *`,
      [name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    res.status(500).json({
      error: "Failed to update user"
    });
  }
});


// DELETE USER
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json({
      message: "User deleted successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete user"
    });
  }
});

// ==================== CATEGORIES CRUD ====================

// CREATE CATEGORY
app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Category name is required"
      });
    }

    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Category already exists"
      });
    }

    res.status(500).json({
      error: "Failed to create category"
    });
  }
});


// READ ALL CATEGORIES
app.get("/api/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY id"
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch categories"
    });
  }
});


// READ ONE CATEGORY
app.get("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch category"
    });
  }
});


// UPDATE CATEGORY
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "Category name is required"
      });
    }

    const result = await pool.query(
      `UPDATE categories
       SET name = $1
       WHERE id = $2
       RETURNING *`,
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Category already exists"
      });
    }

    res.status(500).json({
      error: "Failed to update category"
    });
  }
});


// DELETE CATEGORY
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found"
      });
    }

    res.json({
      message: "Category deleted successfully",
      category: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    if (error.code === "23503") {
      return res.status(409).json({
        error: "Cannot delete category because it is being used by a task"
      });
    }

    res.status(500).json({
      error: "Failed to delete category"
    });
  }
});


// ==================== TASKS CRUD ====================

// CREATE TASK
app.post("/api/tasks", async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      due_date,
      user_id,
      category_id
    } = req.body;

    if (!title || !user_id || !category_id) {
      return res.status(400).json({
        error: "Title, user_id and category_id are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks
       (title, description, status, due_date, user_id, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title,
        description || null,
        status || "pending",
        due_date || null,
        user_id,
        category_id
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(error);

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Invalid user_id or category_id"
      });
    }

    res.status(500).json({
      error: "Failed to create task"
    });
  }
});


// READ ALL TASKS
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         tasks.*,
         users.name AS user_name,
         categories.name AS category_name
       FROM tasks
       JOIN users ON tasks.user_id = users.id
       JOIN categories ON tasks.category_id = categories.id
       ORDER BY tasks.id`
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch tasks"
    });
  }
});


// READ ONE TASK
app.get("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         tasks.*,
         users.name AS user_name,
         categories.name AS category_name
       FROM tasks
       JOIN users ON tasks.user_id = users.id
       JOIN categories ON tasks.category_id = categories.id
       WHERE tasks.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch task"
    });
  }
});


// UPDATE TASK
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      due_date,
      user_id,
      category_id
    } = req.body;

    if (!title || !user_id || !category_id) {
      return res.status(400).json({
        error: "Title, user_id and category_id are required"
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET
         title = $1,
         description = $2,
         status = $3,
         due_date = $4,
         user_id = $5,
         category_id = $6,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        title,
        description || null,
        status || "pending",
        due_date || null,
        user_id,
        category_id,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Invalid user_id or category_id"
      });
    }

    res.status(500).json({
      error: "Failed to update task"
    });
  }
});


// DELETE TASK
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Task not found"
      });
    }

    res.json({
      message: "Task deleted successfully",
      task: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete task"
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});