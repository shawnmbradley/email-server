/* eslint no-console: 0 */

'use strict';

// Replace '../lib/smtp-server' with 'smtp-server' when running this script outside this directory
const SMTPServer = require('smtp-server').SMTPServer;
const simpleParser = require('mailparser').simpleParser;

const fs = require('fs');
const path = require('path');

const SERVER_PORT = 25;
const SERVER_HOST = false;

// Connect to this example server by running
//   telnet localhost 2525
// or
//   nc -c localhost 2525

// Authenticate with this command (username is 'testuser' and password is 'testpass')
//   AUTH PLAIN dGVzdHVzZXIAdGVzdHVzZXIAdGVzdHBhc3M=

// Setup server
module.exports = function(app) {

  const server = new SMTPServer({
    // log to console
    logger: true,
    secure: false,

    // not required but nice-to-have
    banner: 'Welcome to My Awesome SMTP Server',

    // disable STARTTLS to allow authentication in clear text mode
    disabledCommands: ['AUTH', 'STARTTLS'],

    // By default only PLAIN and LOGIN are enabled
    authMethods: ['PLAIN', 'LOGIN', 'CRAM-MD5'],

    // Accept messages up to 10 MB
    size: 10 * 1024 * 1024,

    // allow overriding connection properties. Only makes sense behind proxy
    // useXClient: true,

    // hidePIPELINING: true,

    // use logging of proxied client data. Only makes sense behind proxy
    // useXForward: true,

    // Setup authentication
    // Allow only users with username 'testuser' and password 'testpass'
    onAuth(auth, session, callback) {
        let username = 'test';
        let password = 'test';

        // check username and password
        if (
            auth.username === username &&
            (auth.method === 'CRAM-MD5'
                ? auth.validatePassword(password) // if cram-md5, validate challenge response
                : auth.password === password) // for other methods match plaintext passwords
        ) {
            return callback(null, {
                user: 'userdata' // value could be an user id, or an user object etc. This value can be accessed from session.user afterwards
            });
        }

        return callback(new Error('Authentication failed'));
    },

    // Validate MAIL FROM envelope address. Example allows all addresses that do not start with 'deny'
    // If this method is not set, all addresses are allowed
    onMailFrom(address, session, callback) {
        if (/^deny/i.test(address.address)) {
            return callback(new Error('Not accepted'));
        }
        callback();
    },

    // Validate RCPT TO envelope address. Example allows all addresses that do not start with 'deny'
    // If this method is not set, all addresses are allowed
    onRcptTo(address, session, callback) {
        let err;

        if (/^deny/i.test(address.address)) {
            return callback(new Error('Not accepted'));
        }

        // Reject messages larger than 100 bytes to an over-quota user
        if (address.address.toLowerCase() === 'almost-full@example.com' && Number(session.envelope.mailFrom.args.SIZE) > 100) {
            err = new Error('Insufficient channel storage: ' + address.address);
            err.responseCode = 452;
            return callback(err);
        }

        callback();
    },

    // Handle message stream
    onData(stream, session, callback) {
      let message;

      let chunks = [];

      let attachments = [];
      let mailobj = {
        eml: null,
        headers: null,
        attachments: [],
        text: {}
      };

    //   parser.on('headers', headers => {
    //     let headerObj = {};
    //     for (let [k, v] of headers) {
    //         // We don’t escape the key '__proto__'
    //         // which can cause problems on older engines
    //         headerObj[k] = v;
    //     }
    
    //     mailobj.headers = headerObj;

    //     console.log(mailobj)
    // });
    

    //   parser.on('data', data => {
    //     if (data.type === 'attachment') {
    //         attachments.push(data);
    //         data.chunks = [];
    //         data.chunklen = 0;
    //         let size = 0;
    //         Object.keys(data).forEach(key => {
    //             if (typeof data[key] !== 'object' && typeof data[key] !== 'function') {
    //                 // console.log('%s: %s', key, JSON.stringify(data[key]));
    //             }
    //         });
    //         data.content.on('readable', () => {
    //             let chunk;
    //             while ((chunk = data.content.read()) !== null) {
    //                 size += chunk.length;
    //                 data.chunks.push(chunk);
    //                 data.chunklen += chunk.length;
    //             }
    //         });
    
    //         data.content.on('end', () => {
    //             data.buf = Buffer.concat(data.chunks, data.chunklen);
    //             // console.log('%s: %s B', 'size', size);
    //             // attachment needs to be released before next chunk of
    //             // message data can be processed



    //             mailobj.attachments.push({
    //               fileName: data.filename,
    //               contentType: data.contentType,
    //               fileSize: data.size,
    //               base64: 'data:' + data.contentType + ';base64,' + data.buf.toString('base64')
    //             })
                
    //             data.release();
    //         });
    //     } else {
    //         mailobj.text = data;
    //     }
    //   });
    //   parser.on('end', async () => {

    //     console.log('READY');

    //     parser.updateImageLinks(
    //         (attachment, done) => done(false, 'data:' + attachment.contentType + ';base64,' + attachment.buf.toString('base64')),
    //         (err, html) => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //             if (html) {
    //               // mailobj.attachments.push(html);
    //               // console.log('\n\n ---- \n\n')
    //               // console.log(html)
    //             }

                
                
    //         }
    //     );

    //     parser.on('')

    //     // process.stdout.write(JSON.stringify(mailobj, (k, v) => (k === 'content' || k === 'release' ? undefined : v), 3));
    //   });
      // stream.pipe(parser);
      
      stream.on('data', chunk => {
        chunks.push(chunk);


      })
      stream.on('end', () => {
        // console.log(message);
          let err;
          
          // mailobj.eml = message;

          // // saveEmail(mailobj)

          // setTimeout(() => {
          //   storeMessage(mailobj);
          // }, 10000)

          // parser.write(message);

          let buf = Buffer.concat(chunks);

          // console.log(buf);



          if (stream.sizeExceeded) {
              err = new Error('Error: message exceeds fixed maximum message size 10 MB');
              err.responseCode = 552;
              return callback(err);
          }
          else {
            simpleParser(buf, {
              skipImageLinks: false, // do not convert CID attachments to data URL images
              skipHtmlToText: false, // generate plaintext from HTML if needed
              skipTextToHtml: false, // generate HTML from plaintext if needed
              skipTextLinks: false, // do not linkify links in plaintext content
              formatDateString: date => date.toUTCString() // format date in RFC822 embedded HTML head section
            })
            .then(p => {
              storeMessage(p)
            })
          }
          callback(null, 'Message queued...'); // accept the message once the stream is ended
      });
    }
});

server.on('error', err => {
    console.log('Error occurred');
    console.log(err);
});

const storeMessage = async (msg) => {

  // console.log(msg)

  console.log('\n\n ---- \n\n')

  // console.log(msg)

  // for ( let a in msg.attachments) {

  //   console.log(msg.attachments[a])
    
  // }


  console.log(msg)
  app.service('email/message').create(msg)


  fs.writeFileSync(path.join(__dirname, 'messageSample'), JSON.stringify(msg))

}

// start listening
server.listen(SERVER_PORT, SERVER_HOST);  
}