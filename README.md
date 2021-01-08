# Trader2406
http://Trader2406.NajiKrayem.ca

# Introduction
Trader2406 is a mock trading platform that I built for the course COMP2406 "Fundamentals of Web Applications". It is worth noting that this project was built in the shortest period of time possible, therefore, there is a decent room for improvements. I believe the main feature in my project is the UI; I worked on making the UI impressive and in my design I chose dark colors to keep it easy on the eyes. I also intended on making all the information to be easily accessible.

# Functionalities and Features
### Features implemented:

* Support multiple users
* Sign Up/In/Out
* Account portfolio (cash,holdings, etc.)
* Fund/withdraw cash from account
* Place buy/sell orders and the ability to manage or cancel pending or partial orders
* Create, manage, or delete watchlists
* Add or remove stocks from watchlists
* Create, edit, manage, remove, enable, disable, or view stock movement alarms
* View and filter accountactivity
* Search for and viewing information about stock (updates in real time)
* Beautiful and intuitive UI

### Features NOT implemented:

* Stock historical data
* Admin page
* Save data in MongoDB database
* User Sessions

# Design Choices
I chose to build this website as a single-page app, meaning the server serves all the UI that the user will ever need all at once, and then the rest of the communication will only be JSON. There are two reasons behind my choice: first, speed is extremely important for trading platforms, therefore, it is a good idea to pre-load as much data as you possibly could before you begin trading. Second, processing transactions is a bit CPU intensive, especially for Node.JS because it is not an IO operation, therefore,to keep the user experience swift and lift some weight off the server, it is best to reduce communication between the client and the server.

Since this app is single-page, I used MVC to organise the code. I have split almost every operation in view.js into two functions with similar names; one startswith “view” and the other starts with “controller”. View functions manage the HTML and assign eventListeners, and the controller functions manage the AJAX requests and call view functions. This was not necessary in all cases, but for the sake of keeping things organised and for abiding by my own rules, I did this for most operations. This caused a lot of redundancy in code (i.e. the same app could be done with half the amount of code), but it saved me a lot of time in debugging because everything was clear.

The transaction processing algorithm is simple, when a user places an order, it tries to resolve it immediately by checking if there are other orders compatible with it in the queue, otherwise it adds it to the queue. The orders queue is traversed from oldest to newest order. The algorithm interpolates the cost of the transaction, so it is fair to the buyer and seller.

# Improvements
This is a prototype and there are many possible improvements. As I said the code can be reduced easily which could make it easier to read and a littler faster. Also, the correct request codes can be added; I only used code 200 when things go right and code 401 when things go wrong for everything. Also communication can be made more efficient; I did not always choose the most efficient information to communication with between the client and the server for the sake of keeping things organized so that debugging is easier.

# Modules Used
* Express
* UUID

# Things I like About my Project
I really like the UI and the fact that even though there is a lot of room for performance improvements, it is still super fast! The project also turned out to be surprisingly robust. I am also proud of myself for actually doing my best in making and sticking to a development system which really saved me a lot of time debugging.