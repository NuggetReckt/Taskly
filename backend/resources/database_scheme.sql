---------------------------
-- USERS
---------------------------
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    first_name      VARCHAR(255) NOT NULL,
    last_name       VARCHAR(255) NOT NULL,
    avatar_url      TEXT,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


---------------------------
-- BOARDS
---------------------------
CREATE TABLE IF NOT EXISTS boards (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    background      TEXT,  -- color or image URL
    owner_id        INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


---------------------------
-- BOARD MEMBERSHIPS (permissions)
-- Roles: owner, editor, viewer
---------------------------
CREATE TYPE board_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE IF NOT EXISTS board_members (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            board_role DEFAULT 'viewer',
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(board_id, user_id)
);

---------------------------
-- BOARD INVITES
---------------------------
CREATE TABLE IF NOT EXISTS board_invites (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    invite_code     VARCHAR(255) NOT NULL,
    UNIQUE(board_id)
);

---------------------------
-- LISTS
---------------------------
CREATE TABLE IF NOT EXISTS lists (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    position        INT NOT NULL,  -- ordering for drag & drop
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


---------------------------
-- CARDS (TASKS)
---------------------------
CREATE TABLE IF NOT EXISTS cards (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    list_id         INT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        TIMESTAMPTZ,
    position        INT NOT NULL,  -- ordering within the list
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);


---------------------------
-- CARD ASSIGNEES (many-to-many)
---------------------------
CREATE TABLE IF NOT EXISTS card_assignees (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    card_id         INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(card_id, user_id)
);


---------------------------
-- LABELS
---------------------------
CREATE TABLE IF NOT EXISTS labels (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name            VARCHAR(255),
    color           VARCHAR(20) NOT NULL
);


---------------------------
-- CARD ↔ LABEL many-to-many
---------------------------
CREATE TABLE IF NOT EXISTS card_labels (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    card_id         INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    label_id        INT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    UNIQUE(card_id, label_id)
);


---------------------------
-- COMMENTS
---------------------------
CREATE TABLE IF NOT EXISTS comments (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    card_id         INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    author_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


---------------------------
-- ACTIVITY LOG (card history)
---------------------------
CREATE TABLE IF NOT EXISTS activity_log (
    id              SERIAL PRIMARY KEY,
    board_id        INT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    card_id         INT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,       -- e.g. "moved card", "updated title"
    metadata        JSONB,               -- optional structured data
    created_at      TIMESTAMPTZ DEFAULT NOW()
);


---------------------------
-- IN-APP NOTIFICATIONS
---------------------------
CREATE TYPE notification_type AS ENUM (
    'task_updated',
    'new_comment',
    'due_reminder'
);

CREATE TABLE IF NOT EXISTS notifications (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            notification_type NOT NULL,
    card_id         INT REFERENCES cards(id) ON DELETE CASCADE,
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
