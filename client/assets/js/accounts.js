$().ready(function () {
  const token =
    "n2CQdmKkYDmgSQPNmAvDvwxMQyiiLQf4jkRIPKv1OYf0M9Ku7ezGuy9YeamkH6We";
  const createTable = async function () {
    var table = document.getElementById("accountsTbody");

    const getHistory = async () => {
      const fetchOption = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      };
      const URL = `https://scratchandwin.herokuapp.com/api/Clients?access_token=${token}`;
      return fetch(URL, fetchOption)
        .then(async (response) => {
          const clients = await response.json();
          return clients;
        })
        .catch(() => {
          return new Error("Error on generalStats");
        });
    };
    const data = await getHistory();

    // const myFunction = () => {
    //   var x = document.getElementById("mySelect").value;
    //   document.getElementById("demo").innerHTML = "You selected: " + x;
    // };
    function myFunction() {
      var x = document.getElementById("mySelect").value;
      document.getElementById("demo").innerHTML = "You selected: " + x;
    }
    for (let index = data.length - 1; index >= 0; index--) {
      const element = data[index];
      var row = table.insertRow(0);
      var cell0 = row.insertCell(0);
      var cell1 = row.insertCell(1);
      var cell2 = row.insertCell(2);
      var cell3 = row.insertCell(3);
      var cell4 = row.insertCell(4);
      var cell5 = row.insertCell(5);
      var cell6 = row.insertCell(6);

      cell0.innerHTML = `${index + 1}`;
      cell1.innerHTML = `${element.firstName || "-"} ${
        element.lastName || "-"
      }`;
      cell2.innerHTML = `${element.tockens}`;
      cell3.innerHTML = `${element.isActive ? "active" : "blocked"}`;
      cell4.innerHTML = `${element.win}/${element.losses}`;
      cell5.innerHTML = `${element.winRatio.toFixed(2)}`;

      cell6.innerHTML = `<select id="my-select-${element.id}" >
														<option value="1">${element.winProb}</option>
														<option value="10">10</option>
														<option value="20">20</option>
														<option value="30">30</option>
														<option value="40">40</option>
														<option value="50">50</option>
														<option value="60">60</option>
														<option value="70">70</option>
														<option value="80">80</option>
														<option value="90">90</option>
													</select>`;
      document
        .getElementById(`my-select-${element.id}`)
        .addEventListener("change", function () {
          const getGeneralStats = async () => {
            document.getElementById("accountsTbody").style.display = "none";
            document.getElementById("loader").style.display = "block";
            const fetchOption = {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ...element, winProb: this.value }),
            };
            const URL = `https://scratchandwin.herokuapp.com/api/Clients/${element.id}?access_token=${token}`;
            return fetch(URL, fetchOption)
              .then(async (response) => {
                const resp = await response.json();
                alert("User was updated");
                location.reload();
                return resp;
              })
              .catch(() => {
                return new Error("Error on generalStats");
              });
          };
          getGeneralStats();
        });
    }
  };
  createTable();
  document.getElementById("loader").style.display = "none";
});
