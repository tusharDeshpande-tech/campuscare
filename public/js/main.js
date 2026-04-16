const feedbackForm = document.getElementById("feedbackForm");
const formSuccess = document.getElementById("formSuccess");

if (feedbackForm) {
  feedbackForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (formSuccess) {
      formSuccess.style.display = "flex";
    }

    this.reset();

    setTimeout(() => {
      if (formSuccess) formSuccess.style.display = "none";
    }, 3000);
  });
}
