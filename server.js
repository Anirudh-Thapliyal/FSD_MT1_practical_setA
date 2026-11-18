const http = require("http");

let books = [
    { id: 1, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction" },
    { id: 2, title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography" },
    { id: 3, title: "Atomic Habits", author: "James Clear", category: "Self-help" },
    { id: 4, title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic" }
];

const PORT = 3000;

function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json"
    });
    res.end(JSON.stringify(data, null, 2));
}

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", reject);
    });
}

const server = http.createServer(async (req, res) => {

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (req.method === "GET" && pathname === "/books") {
        return sendJSON(res, 200, books);
    }

    if (req.method === "GET" && pathname.startsWith("/books/")) {
        const id = Number(pathname.split("/")[2]);

        const book = books.find(item => item.id === id);

        if (!book) {
            return sendJSON(res, 404, {
                message: "Book not found"
            });
        }

        return sendJSON(res, 200, book);
    }

    if (req.method === "POST" && pathname === "/books") {
        try {
            const data = await readRequestBody(req);

            if (!data.title || !data.author || !data.category) {
                return sendJSON(res, 400, {
                    message: "All fields are required"
                });
            }

            const newBook = {
                id: books.length
                    ? Math.max(...books.map(book => book.id)) + 1
                    : 1,
                title: data.title,
                author: data.author,
                category: data.category
            };

            books.push(newBook);

            return sendJSON(res, 201, {
                message: "Book added successfully",
                book: newBook
            });

        } catch (error) {
            return sendJSON(res, 400, {
                message: "Invalid JSON body"
            });
        }
    }

    if (req.method === "PUT" && pathname.startsWith("/books/")) {
        try {
            const id = Number(pathname.split("/")[2]);

            const book = books.find(item => item.id === id);

            if (!book) {
                return sendJSON(res, 404, {
                    message: "Book not found"
                });
            }

            const data = await readRequestBody(req);

            if (!data.title || !data.author || !data.category) {
                return sendJSON(res, 400, {
                    message: "All fields are required"
                });
            }

            book.title = data.title;
            book.author = data.author;
            book.category = data.category;

            return sendJSON(res, 200, {
                message: "Book updated successfully",
                book: book
            });

        } catch (error) {
            return sendJSON(res, 400, {
                message: "Invalid JSON body"
            });
        }
    }

    if (req.method === "DELETE" && pathname.startsWith("/books/")) {
        const id = Number(pathname.split("/")[2]);

        const index = books.findIndex(item => item.id === id);

        if (index === -1) {
            return sendJSON(res, 404, {
                message: "Book not found"
            });
        }

        const deletedBook = books.splice(index, 1)[0];

        return sendJSON(res, 200, {
            message: "Book deleted successfully",
            book: deletedBook
        });
    }

    return sendJSON(res, 404, {
        message: "Route not found"
    });
});

server.listen(PORT, () => {
    console.log(
        `Library Management System running at http://localhost:${PORT}`
    );
});
