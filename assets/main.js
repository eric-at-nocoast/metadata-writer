const client = ZAFClient.init();
client.invoke("hide");

let ticketId = 0;
let ipField = "";
let browserClientField = "";

//Get the ticketId and check if the custom ticketFields already have values.
async function getTicketInfo() {
  const context = await client.context();
  ticketId = context.ticketId;

  const fieldGetter = await client.request({
    url: `/api/v2/tickets/${ticketId}`,
  });
  let ip = fieldGetter.ticket.custom_fields.find(
    (obj) => obj.id === 123
  );
  let browserClient = fieldGetter.ticket.custom_fields.find(
    (obj) => obj.id === 456
  );

  ipField = ip.value;
  browserClientField = browserClient.value;
}

//Grab the metadata, if the custom ticket fields don't have data already, then set the metadata into the ticket fields. 
async function setTicketFields() {
  await getTicketInfo();
  const metadata = await client.request({
    url: `/api/v2/tickets/${ticketId}/comments`,
    httpCompleteResponse: true,
  });
  let ipValue = metadata.responseJSON.comments[0].metadata.system.ip_address;
  let browserClientValue =
    metadata.responseJSON.comments[0].metadata.system.client;


  if (ipField == null || ipField == "") {
    try {
      client.request({
        url: `/api/v2/tickets/${ticketId}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
          ticket: {
            custom_fields: [{ id: 123, value: ipValue }],
          },
        }),
      });
    } catch (err) {
      client.invoke("notify", `Error: ${err.responseText}`, "error");
      console.log("Error:", err);
    }
  }
  if (browserClientField == null || browserClientField == "") {
    try {
      client.request({
        url: `/api/v2/tickets/${ticketId}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
          ticket: {
            custom_fields: [{ id: 456, value: browserClientValue }],
          },
        }),
      });
    } catch (err) {
      client.invoke("notify", `Error: ${err.responseText}`, "error");
      console.log("Error:", err);
    }
  }
}

setTicketFields();
