document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // on submit
  document.querySelector("#compose-form").addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipients = '', subject = '', body = '') {
//recipients = '', subject = '', body = ''
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-disp').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;


  
}
   

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-disp').style.display = 'none';

  document.querySelector('#email-disp').innerHTML='';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h4>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h4>`;

  //load the emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      emails.forEach(email => {
        const emailDiv = document.createElement('div');
        emailDiv.className = `list-group-item list-group-item-action d-flex justify-content-between align-items-center ${emails.read ? "bg-light" : ""}`;
        emailDiv.innerHTML = `
         <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${email.sender}</h5>
            <small class="mb-1"> ${email.subject}</small>
            <small class="text-muted">${email.timestamp}</small>
          </div><br>
        `;
        document.querySelector("#emails-view").append(emailDiv);
        
        //document.querySelector('#emails-view')
        emailDiv.addEventListener('click', () => {
          view_mail(email.id)}
        );

        if(!email.read){
          emailDiv.style.backgroundColor = 'white';
        }else{
          emailDiv.style.backgroundColor = 'lightgray';
        }
        
        
      });
  })
  .catch(error => {
    console.log('ERROR', error);
  });
}

function send_mail(event){
  event.preventDefault();
  // storing data
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // sending data
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
  })
  .catch(error => {
    console.log('ERROR', error);
  });
}

function view_mail(email_id){
  document.querySelector('#email-disp').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(emails => {
      // Print email
      console.log(emails);

      // displaying the email
      const emailDisp = document.createElement('div');
      emailDisp.innerHTML ='';
      emailDisp.innerHTML = `
        <div class="card shadow-sm p-3">
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>From:</strong> ${emails.sender}</li>
            <li class="list-group-item"><strong>Subject:</strong> ${emails.subject}</li>
            <li class="list-group-item"><strong>On:</strong> <small>${emails.timestamp}</small></li>
            <li class="list-group-item bg-light">${emails.body}</li>
          </ul>
        </div>`;
        

        // reply button
        const repbtn = document.createElement('button');
        repbtn.innerText = "Reply";
        repbtn.className = "btn btn-primary";
        repbtn.addEventListener('click', () => {

          compose_email();

          // Prefill composition fields
          const recipients = emails.sender;
          let subject = emails.subject;
          const body = `On ${emails.timestamp}, ${emails.sender} wrote: ${emails.body}`;

          // checking if the subject starts with RE:
          if (!subject.startsWith("Re: ")){
            subject = `Re: ${emails.subject}`;
          }
          document.querySelector('#compose-recipients').value = recipients;
          document.querySelector('#compose-subject').value = subject;
          document.querySelector('#compose-body').value = body;
          
          
        });
        

        // archive and unarchive button and its function
        const arcbtn = document.createElement('button');
        arcbtn.className = "btn btn-secondary";
        if (!emails.archived){
          arcbtn.innerText = 'Archive'
          arcbtn.addEventListener('click', ()=>{
            fetch(`/emails/${emails.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
            .then(()=>{
              load_mailbox('inbox');
            })
          });

        }else{
          arcbtn.innerText = 'UnArchive'
          arcbtn.className = "btn btn-outline-secondary";
          arcbtn.addEventListener('click', ()=>{
            fetch(`/emails/${emails.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })
            .then(()=>{
              load_mailbox('inbox');
            });

          
          });
        }
      
      // fixing the buttons' style problems
      const btnContainer = document.createElement("div");
      btnContainer.className = "d-flex gap-2 mt-3";
      btnContainer.append(arcbtn, repbtn);
      document.querySelector("#email-disp").append(emailDisp, btnContainer);
      
      
      
      

      //changing the read status to true
      if(!emails.read){
        fetch(`/emails/${emails.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        });
      }
    
  });
  }