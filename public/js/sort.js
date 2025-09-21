const sortSelect = document.getElementById("sort");

sortSelect.addEventListener("change", function () {
  const selected = this.value;
  const url = new URL(window.location);
  url.searchParams.set("sort", selected);
  window.location.href = url.toString();
});
