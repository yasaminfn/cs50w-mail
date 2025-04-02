document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', ()=> compose_email());

  // on submit
  document.querySelector("#compose-form").addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipients = '', subject = '', body = '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-disp').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Prefill composition fields
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
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //load the emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      emails.forEach(email => {
        const emailDiv = document.createElement('div');

        emailDiv.innerHTML = `
        From : ${email.sender} <br>
        Subject : ${email.subject} <br>
        Time : ${email.timestamp}
        `;
        document.querySelector("#emails-view").append(emailDiv);
        
        //document.querySelector('#emails-view')
        emailDiv.addEventListener('click', () => {
          view_mail(email.id)}
        );

        if(!email.read){
          emailDiv.style.backgroundColor = 'white';
        }else{
          emailDiv.style.backgroundColor = 'gray';
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
        From : ${emails.sender} <br>
        Subject : ${emails.subject} <br>
        On : ${emails.timestamp} <br>
        Body : ${emails.body}<br>
        `;

        // reply button
        const repbtn = document.createElement('button');
        repbtn.innerText = "Reply";
        repbtn.addEventListener('click', () => {
          // Prefill composition fields
          const recipients = emails.recipients;;
          const subject = `Re: ${emails.subject}`;
          const body = `On ${emails.timestamp}, \n ${emails.sender} wrote: \n ${emails.body}`;
          document.querySelector('#compose-recipients').value = recipients;
          document.querySelector('#compose-subject').value = subject;
          document.querySelector('#compose-body').value = body;
          
          compose_email(recipients,subject,body);
        });
        

        // archive and unarchive button and its function
        const arcbtn = document.createElement('button');
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
        
      document.querySelector("#email-disp").append(emailDisp);
      document.querySelector("#email-disp").append(arcbtn);
      document.querySelector("#email-disp").append(repbtn);
      
      

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