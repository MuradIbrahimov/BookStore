-- Index for faster searches on admin email
CREATE INDEX idx_admin_email ON `bookstoredb`.`admin` (`email`);

-- Index for author URL
CREATE INDEX idx_author_url ON `bookstoredb`.`author` (`url`);

-- Index for book category
CREATE INDEX idx_book_category ON `bookstoredb`.`book` (`category`);

-- Index for author_book relationships
CREATE INDEX idx_author_book_author_name ON `bookstoredb`.`author_book` (`author_name`);
CREATE INDEX idx_author_book_book_isbn ON `bookstoredb`.`author_book` (`book_isbn`);

-- Index for award year
CREATE INDEX idx_award_year ON `bookstoredb`.`award` (`year`);

-- Index for award_author relationships
CREATE INDEX idx_award_author_award_name ON `bookstoredb`.`award_author` (`award_name`);
CREATE INDEX idx_award_author_author_name ON `bookstoredb`.`award_author` (`author_name`);

-- Index for award_book relationships
CREATE INDEX idx_award_book_award_name ON `bookstoredb`.`award_book` (`award_name`);
CREATE INDEX idx_award_book_book_isbn ON `bookstoredb`.`award_book` (`book_isbn`);

-- Index for customer email
CREATE INDEX idx_customer_email ON `bookstoredb`.`customer` (`email`);

-- Index for shopping_baskets order_date
CREATE INDEX idx_shopping_baskets_order_date ON `bookstoredb`.`shopping_baskets` (`order_date`);

-- Index for contains relationships
CREATE INDEX idx_contains_shopping_basket_id ON `bookstoredb`.`contains` (`shopping_basket_id`);
CREATE INDEX idx_contains_book_isbn ON `bookstoredb`.`contains` (`book_isbn`);

-- Index for warehouses phone
CREATE INDEX idx_warehouses_phone ON `bookstoredb`.`warehouses` (`phone`);

-- Index for inventory warehouse_code
CREATE INDEX idx_inventory_warehouse_code ON `bookstoredb`.`inventory` (`warehouse_code`);
CREATE INDEX idx_inventory_book_isbn ON `bookstoredb`.`inventory` (`book_isbn`);

-- Index for received_by relationships
CREATE INDEX idx_received_by_award_name ON `bookstoredb`.`received_by` (`award_name`);
CREATE INDEX idx_received_by_author_name ON `bookstoredb`.`received_by` (`author_name`);

-- Index for reservation customer_email
CREATE INDEX idx_reservation_customer_email ON `bookstoredb`.`reservation` (`customer_email`);
CREATE INDEX idx_reservation_book_isbn ON `bookstoredb`.`reservation` (`book_isbn`);

-- Index for sessions admin_id
CREATE INDEX idx_sessions_admin_id ON `bookstoredb`.`sessions` (`admin_id`);
