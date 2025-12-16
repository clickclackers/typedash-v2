BEGIN;
-- Books
INSERT INTO challenges (id, title, category, author, text, text_hash)
SELECT id, title, category, author, text, md5(text)
FROM (
    VALUES
        (1, 'To Kill a Mockingbird', 'Books', 'Harper Lee', 'Atticus said to Jem one day, ''I''d rather you shot at tin cans in the backyard, but I know you''ll go after birds. Shoot all the blue jays you want if you can hit ''em, but remember it''s a sin to kill a mockingbird.'''),
        (2, '1984', 'Books', 'George Orwell', 'You had to cling on to that. When you put in words it sounded reasonable: it was when you looked at the human beings passing you on the pavement that it became an act of faith.'),
        (3, 'Fahrenheit 451', 'Books', 'Ray Bradbury', 'He felt his smile slide away, melt, fold over, and down on itself like a tallow skin, like the stuff of a fantastic candle burning too long and now collapsing and now blown out.'),
        (4, 'The Hunger Games', 'Books', 'Suzanne Collins', 'The agony of kissing Gale so hard returns to me, and I think, why did I do that? Because I couldn''t help myself. Gale''s mine. I''m his. Anything else is unthinkable.'),
        (5, 'Harry Potter and the Philosopher''s Stone', 'Books', 'J.K. Rowling', 'He sat up and clutched the package to his chest. ''I''m going to have a lot of fun with Dudley this summer,'' he grinned maliciously. With that, he fell asleep, and all his dreams were sweet.'),
        (6, 'Jane Eyre', 'Books', 'Charlotte Brontë', 'I could see nothing but the dense darkness; yet it seemed that, in a second, my eyes grew used to the obscurity, and I could make out the velvet blackness of her eyes'),
        (7, 'The Great Gatsby', 'Books', 'F. Scott Fitzgerald', 'So we beat on, boats against the current, borne back ceaselessly into the past.'),
        (8, 'To the Lighthouse', 'Books', 'Virginia Woolf', 'I have often wondered how it would feel to live a life where nothing mattered but the present moment.'),
        (9, 'The Catcher in the Rye', 'Books', 'J.D. Salinger', 'If you really want to hear about it, the first thing you''ll probably want to know is where I was born, and what my lousy parents were doing and all that junk, but I don''t feel like going into it, if you want to know the truth.'),
        (10, 'The Lord of the Rings', 'Books', 'J.R.R. Tolkien', 'The world is not in your books and maps; it is made up of living people, who lived and died in places forgotten now.'),
        (11, 'The Hobbit', 'Books', 'J.R.R. Tolkien', 'In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.')
) AS t(id, title, category, author, text)
ON CONFLICT (id) DO NOTHING;

-- Songs
INSERT INTO challenges (id, title, category, author, text, text_hash)
SELECT id, title, category, author, text, md5(text)
FROM (
    VALUES
        (1001, 'Imagine', 'Songs', 'John Lennon', 'Imagine there''s no heaven. It''s easy if you try. No hell below us. Above us only sky. Imagine all the people living for today.'),
        (1002, 'Shape of You', 'Songs', 'Ed Sheeran', 'The club isn''t the best place to find a lover, so the bar is where I go. Me and my friends at the table doing shots, drinking fast, and then we talk slow.'),
        (1003, 'Don''t Stop Believin''', 'Songs', 'Journey', 'Just a small-town girl, living in a lonely world. She took the midnight train going anywhere. Just a city boy, born and raised in South Detroit. He took the midnight train going anywhere.'),
        (1004, 'Blinding Lights', 'Songs', 'The Weeknd', 'I''ve been tryna call. I''ve been on my own for long enough. Maybe you can show me how to love, maybe. I''m going through withdrawals.'),
        (1005, 'Rolling in the Deep', 'Songs', 'Adele', 'There''s a fire starting in my heart, reaching a fever pitch and it''s bringing me out the dark. Finally, I can see you crystal clear.'),
        (1006, 'Billie Jean', 'Songs', 'Michael Jackson', 'She was more like a beauty queen from a movie scene. I said, ''Don''t mind, but what do you mean, I am the one who will dance on the floor in the round?'''),
        (1007, 'Hey Jude', 'Songs', 'The Beatles', 'Hey Jude, don''t make it bad. Take a sad song and make it better. Remember to let her into your heart. Then you can start to make it better.'),
        (1008, 'Wrecking Ball', 'Songs', 'Miley Cyrus', 'We clawed, we chained, our hearts in vain. We jumped, never asking why. We kissed, I fell under your spell. A love no one could deny.'),
        (1009, 'Blank Space', 'Songs', 'Taylor Swift', 'Nice to meet you, where you been? I could show you incredible things. Magic, madness, heaven, sin. Saw you there, and I thought ''Oh my God, look at that face'''),
        (1010, 'Bohemian Rhapsody', 'Songs', 'Queen', 'Is this the real life? Is this just fantasy? Caught in a landslide, no escape from reality. Open your eyes, look up to the skies and see.')
) AS t(id, title, category, author, text)
ON CONFLICT (id) DO NOTHING;

-- Algorithms
INSERT INTO challenges (id, title, category, author, text, text_hash)
SELECT id, title, category, author, text, md5(text)
FROM (
    VALUES
        (2001, 'Bubble Sort', 'Algorithms', '-', 'def bubble_sort(arr): n = len(arr) for i in range(n): for j in range(n - i - 1): if arr[j] > arr[j + 1]: arr[j], arr[j + 1] = arr[j + 1], arr[j]'),
        (2002, 'Linear Search', 'Algorithms', '-', 'def linear_search(arr, target): for i, x in enumerate(arr): if x == target: return i return -1'),
        (2003, 'Fibonacci Sequence (Recursive)', 'Algorithms', '-', 'def fib(n): if n <= 1: return n else: return fib(n - 1) + fib(n - 2)'),
        (2004, 'Selection Sort', 'Algorithms', '-', 'def selection_sort(arr): n = len(arr) for i in range(n): min_idx = i for j in range(i, n): if arr[j] < arr[min_idx]: min_idx = j arr[i], arr[min_idx] = arr[min_idx], arr[i]'),
        (2005, 'Merge Sort', 'Algorithms', '-', 'def merge_sort(arr): if len(arr) <= 1: return arr else: mid = len(arr) // 2 left = merge_sort(arr[:mid]) right = merge_sort(arr[mid:]) return merge(left, right)')
) AS t(id, title, category, author, text)
ON CONFLICT (id) DO NOTHING;

COMMIT;