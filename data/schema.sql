DROP TABLE weathers, meetups, locations;

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(225),
    formatted_query VARCHAR(255),
    latitude NUMERIC(8,6),
    longitude NUMERIC(9,6)
);

CREATE TABLE IF NOT EXISTS weathers (
    id SERIAL PRIMARY KEY,
    forecast VARCHAR(225),
    time VARCHAR(255),
    location_id INTEGER NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations (id)
);

CREATE TABLE IF NOT EXISTS meetups (
    id SERIAL PRIMARY KEY,
    link VARCHAR (255),
    name VARCHAR(255),
    creation_date CHAR(15),
    host VARCHAR (255),
    location_id INTEGER NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations (id)
);
CREATE TABLE IF NOT EXISTS trials (
    id SERIAL PRIMARY KEY,
    trail_url VARCHAR (255),
    name VARCHAR(255),
    locations VARCHAR(225),
    length NUMERIC(2,1),
    condition_date CHAR(15),
    condition_time CHAR(15),
    condition VARCHAR (255),
    stars NUMERIC (2,1),
    stars_votes INTEGER NOT NULL,
    summary VARCHAR (255),
    location_id INTEGER NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations (id)
);