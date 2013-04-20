CREATE TABLE people (
    user_id SERIAL PRIMARY KEY,
    mod_time timestamp DEFAULT current_timestamp,
    location_lat double precision,
    location_lng double precision
);