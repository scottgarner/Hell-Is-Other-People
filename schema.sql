CREATE TABLE people (
    user_id character(32) PRIMARY KEY,
    mod_time timestamp DEFAULT current_timestamp,
    location_lat double precision,
    location_lng double precision
);