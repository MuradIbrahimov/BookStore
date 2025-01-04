-- Insert data for `admin`
INSERT INTO `bookstoredb`.`admin` (`name`, `email`, `password`, `role`)
VALUES
('Alice Johnson', 'alice.johnson@bookstore.com', 'password1', 'admin'),
('Bob Smith', 'bob.smith@bookstore.com', 'password2', 'admin'),
('Charlie Brown', 'charlie.brown@bookstore.com', 'password3', 'super_admin'),
('Dana White', 'dana.white@bookstore.com', 'password4', 'admin'),
('Eve Black', 'eve.black@bookstore.com', 'password5', 'super_admin');

-- Insert data for `author`
INSERT INTO `bookstoredb`.`author` (`name`, `address`, `url`)
VALUES
('Mark Twain', 'New York, USA', 'https://marktwain.com'),
('Jane Austen', 'Bath, UK', 'https://janeausten.org'),
('Ernest Hemingway', 'Chicago, USA', 'https://ernesthemingway.com'),
('Agatha Christie', 'Devon, UK', 'https://agathachristie.com'),
('Leo Tolstoy', 'Moscow, Russia', 'https://leotolstoy.com');

-- Insert data for `book` (ISBN limited to 5 digits)
INSERT INTO `bookstoredb`.`book` (`isbn`, `category`, `price`, `title`, `year`)
VALUES
(12345, 'Fiction', '10.99', 'Adventures of Huckleberry Finn', 1884),
(54321, 'Romance', '12.99', 'Pride and Prejudice', 1813),
(11111, 'Fiction', '14.99', 'The Old Man and the Sea', 1952),
(22222, 'Mystery', '9.99', 'Murder on the Orient Express', 1934),
(33333, 'Philosophy', '19.99', 'War and Peace', 1869);

-- Insert data for `author_book`
INSERT INTO `bookstoredb`.`author_book` (`author_name`, `book_isbn`)
VALUES
('Mark Twain', 12345),
('Jane Austen', 54321),
('Ernest Hemingway', 11111),
('Agatha Christie', 22222),
('Leo Tolstoy', 33333);

-- Insert data for `award`
INSERT INTO `bookstoredb`.`award` (`name`, `year`)
VALUES
('Pulitzer Prize', 1923),
('Man Booker Prize', 1969),
('Nobel Prize', 1901),
('National Book Award', 1950),
('Hugo Award', 1953);

-- Insert data for `award_author`
INSERT INTO `bookstoredb`.`award_author` (`award_name`, `author_name`)
VALUES
('Pulitzer Prize', 'Mark Twain'),
('Man Booker Prize', 'Jane Austen'),
('Nobel Prize', 'Leo Tolstoy'),
('National Book Award', 'Agatha Christie'),
('Hugo Award', 'Ernest Hemingway');

-- Insert data for `award_book`
INSERT INTO `bookstoredb`.`award_book` (`award_name`, `book_isbn`)
VALUES
('Pulitzer Prize', 12345),
('Man Booker Prize', 54321),
('Nobel Prize', 33333),
('National Book Award', 22222),
('Hugo Award', 11111);

-- Insert data for `customer`
INSERT INTO `bookstoredb`.`customer` (`email`, `password`, `name`, `address`, `phone`)
VALUES
('customer1@example.com', 'pass1', 'Alice Wonderland', '123 Elm Street, NY', '123-456-7890'),
('customer2@example.com', 'pass2', 'Bob Builder', '456 Oak Avenue, LA', '234-567-8901'),
('customer3@example.com', 'pass3', 'Charlie Chaplin', '789 Pine Road, SF', '345-678-9012'),
('customer4@example.com', 'pass4', 'Diana Ross', '321 Maple Blvd, CH', '456-789-0123'),
('customer5@example.com', 'pass5', 'Evan Peters', '654 Cedar Way, TX', '567-890-1234');

-- Insert data for `shopping_baskets`
INSERT INTO `bookstoredb`.`shopping_baskets` (`order_date`, `customer_email`, `locked_by`, `locked_at`)
VALUES
(CURDATE(), 'customer1@example.com', NULL, NULL),
(CURDATE(), 'customer2@example.com', NULL, NULL),
(CURDATE(), 'customer3@example.com', NULL, NULL),
(CURDATE(), 'customer4@example.com', NULL, NULL),
(CURDATE(), 'customer5@example.com', NULL, NULL);

-- Insert data for `contains`
INSERT INTO `bookstoredb`.`contains` (`shopping_basket_id`, `book_isbn`, `quantity`)
VALUES
(1, 12345, 1),
(2, 54321, 2),
(3, 11111, 3),
(4, 22222, 4),
(5, 33333, 5);

-- Insert data for `warehouses`
INSERT INTO `bookstoredb`.`warehouses` (`code`, `address`, `phone`)
VALUES
('WH01', '100 Warehouse Ave, NY', '123-456-0000'),
('WH02', '200 Storage Rd, LA', '234-567-0001'),
('WH03', '300 Depot St, SF', '345-678-0002'),
('WH04', '400 Terminal Blvd, CH', '456-789-0003'),
('WH05', '500 Stockpile Ln, TX', '567-890-0004');

-- Insert data for `inventory`
INSERT INTO `bookstoredb`.`inventory` (`warehouse_code`, `book_isbn`, `number`)
VALUES
('WH01', 12345, 50),
('WH02', 54321, 100),
('WH03', 11111, 200),
('WH04', 22222, 300),
('WH05', 33333, 400);

-- Insert data for `reservation`
INSERT INTO `bookstoredb`.`reservation` (`reservation_date`, `pickup_time`, `customer_email`, `book_isbn`)
VALUES
(CURDATE(), '10:00:00', 'customer1@example.com', 12345),
(CURDATE(), '11:00:00', 'customer2@example.com', 54321),
(CURDATE(), '12:00:00', 'customer3@example.com', 11111),
(CURDATE(), '13:00:00', 'customer4@example.com', 22222),
(CURDATE(), '14:00:00', 'customer5@example.com', 33333);
