-- SIM-KB Light Test Schema
-- Schema.org-aligned knowledge graph for BPSer data
-- SQLite version with JSON embeddings for semantic search

-- Organizations (schema:Organization) - Insurance carriers
CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hemlix_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    schema_type TEXT DEFAULT 'Organization',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products (schema:Product) - Insurance product types
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hemlix_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    product_type TEXT NOT NULL, -- Life, Annuity, ABLTC, Disability
    description TEXT,
    schema_type TEXT DEFAULT 'Product',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- People (schema:Person) - BPSer team members
CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hemlix_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    schema_type TEXT DEFAULT 'Person',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles (schema:Role) - C-suite roles
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hemlix_id TEXT UNIQUE NOT NULL,
    role_name TEXT NOT NULL,
    role_short_name TEXT,
    description TEXT,
    temperature REAL,
    goal TEXT,
    backstory TEXT,
    schema_type TEXT DEFAULT 'Role',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employment Relationships (Person ↔ Organization ↔ Role)
CREATE TABLE IF NOT EXISTS employment_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    organization_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (person_id) REFERENCES people(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id),
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Documents/CreativeWork (schema:CreativeWork)
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hemlix_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    document_type TEXT NOT NULL, -- research, carrier_scorecard, question_scorecard, production_history
    content TEXT,
    metadata TEXT, -- JSON blob
    file_path TEXT,
    schema_type TEXT DEFAULT 'CreativeWork',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document-Organization Links (Org ↔ CreativeWork)
CREATE TABLE IF NOT EXISTS document_org_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    organization_id INTEGER NOT NULL,
    relationship_type TEXT, -- scorecard, research, background
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Document-Product Links (Product ↔ CreativeWork)
CREATE TABLE IF NOT EXISTS document_product_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    FOREIGN KEY (document_id) REFERENCES documents(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Offers (schema:Offer) - Performance metrics as "offers"
CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hemlix_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    offer_type TEXT, -- question_score, ranking
    value REAL,
    metadata TEXT, -- JSON blob
    schema_type TEXT DEFAULT 'Offer',
    year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product-Offer Links (Product ↔ Offer)
CREATE TABLE IF NOT EXISTS product_offer_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    offer_id INTEGER NOT NULL,
    organization_id INTEGER, -- Which carrier this offer is for
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (offer_id) REFERENCES offers(id),
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Embeddings for semantic search
CREATE TABLE IF NOT EXISTS embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- documents, organizations, products
    entity_id INTEGER NOT NULL,
    chunk_index INTEGER DEFAULT 0,
    chunk_text TEXT NOT NULL,
    embedding_vector TEXT, -- JSON array of floats
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hemlix Registry (global identifier registry)
CREATE TABLE IF NOT EXISTS hemlix_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hemlix_id TEXT UNIQUE NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_embeddings_entity ON embeddings(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_hemlix_registry_id ON hemlix_registry(hemlix_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
