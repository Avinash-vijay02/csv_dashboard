from flask import Flask, request, render_template_string
import pandas as pd

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        file = request.files["file"]
        if file:
            df = pd.read_csv(file)
            duplicates = df[df.duplicated()]
            return duplicates.to_html()
    return render_template_string("""
        <form action="/" method="post" enctype="multipart/form-data">
            <input type="file" name="file">
            <button type="submit">Find Duplicates</button>
        </form>
    """)

if __name__ == "__main__":
    app.run(debug=True)
