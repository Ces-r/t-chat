from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)


# simple program that was used to test out connectivity through my routers ip and my raspberry-
# using port-forwarding. 


@app.route('/')
def index():
    return render_template("index.html")



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)