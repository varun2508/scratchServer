$().ready(function() {
  console.log("----------accounts");

  const createTable = async function() {
    console.log("----------calling table funcitn");
    var table = document.getElementById("accountsTbody");

    const getHistory = async () => {
      console.log("-----getting history-----");

      const fetchOption = {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      };
      const URL = `http://localhost:3000/api/Clients?access_token=2qo9yXDrub7Nt26PHhbzxT2aplK0inWSraXHMqwC0DQ37OvPcfex9WNjAEn6CNrs`;
      return fetch(URL, fetchOption)
        .then(async response => {
          const clients = await response.json();
          console.log("----------winhistoru", clients);
          return clients;
        })
        .catch(() => {
          console.log("----------error winhistoru");
          return new Error("Error on generalStats");
        });
    };
    const data = await getHistory();

    console.log("----------data", data);
    for (let index = data.length - 1; index >= 0; index--) {
      const element = data[index];
      var row = table.insertRow(0);
      var cell0 = row.insertCell(0);
      var cell1 = row.insertCell(1);
      var cell2 = row.insertCell(2);
      var cell3 = row.insertCell(3);
      var cell4 = row.insertCell(4);
      var cell5 = row.insertCell(5);

      cell0.innerHTML = `${index + 1}`;
      cell1.innerHTML = `${element.firstName || "-"} ${element.lastName ||
        "-"}`;
      cell2.innerHTML = `${element.tockens}`;
      cell3.innerHTML = `${element.isActive ? "active" : "blocked"}`;
      cell4.innerHTML = `${element.win}/${element.losses}`;
      cell5.innerHTML = `${element.winRatio.toFixed(2)}`;
    }
    document.getElementById("loader").style.display = "none";
  };

  createTable();
});
