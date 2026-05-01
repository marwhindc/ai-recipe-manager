ALTER TABLE recipes
    ADD CONSTRAINT fk_recipes_user_id
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    NOT VALID;
