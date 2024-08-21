'use client';

import { Stack, Box, TextField, Typography, Button, Rating } from "@mui/material";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to EcoCharge Customer Support! How can I assist you today?" },
  ]);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState(null);
  const messagesEndRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const parseBoldText = (text) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    return text.replace(boldRegex, "<strong>$1</strong>");
  };

  const sendMessage = async () => {
    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
    ])
  
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()  // Get a reader to read the response body
      const decoder = new TextDecoder()  // Create a decoder to decode the response text
  
      let result = ''
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
          ]
        })
        return reader.read().then(processText)  // Continue reading the next chunk of the response
      })
    })
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const backgroundStyle = {
    background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, #1e1e1e, #0d0d0d)`,
    transition: 'background 0.1s ease'
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      padding={2}
      sx={backgroundStyle}
    >
      <Stack
        spacing={2}
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          width: { xs: '90%', sm: '75%', md: '50%', lg: '500px' },
          height: { xs: '80%', md: '700px' },
          border: 1,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "#2c2c2c",
        }}
      >
        <Box
          flexGrow={1}
          width="100%"
          overflow="auto"
          display="flex"
          flexDirection="column"
          padding={2}
          bgcolor="#2c2c2c"
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.role === "assistant" ? "flex-start" : "flex-end"}
              width="100%"
              padding={1}
            >
              <Box
                bgcolor={msg.role === "assistant" ? "#00bcd4" : "#424242"}
                color="white"
                borderRadius={2}
                padding={1.5}
                maxWidth="75%"
                boxShadow={2}
              >
                <Typography dangerouslySetInnerHTML={{ __html: parseBoldText(msg.content) }}/>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        <Stack spacing={2} direction="row" width="100%" padding={1}>
          <TextField
            label="Type a message"
            variant="outlined"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            InputProps={{
              style: {
                color: 'white',
                borderColor: '#424242'
              }
            }}
            InputLabelProps={{
              style: { color: '#aaa' }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            sx={{ backgroundColor: '#00bcd4', fontFamily: 'poppins' }}
          >
            Send
          </Button>
        </Stack>
      </Stack>

      {/* Feedback Section */}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        width="100%"
        marginTop={2}
      >
        <Typography variant="h6" color="white" sx={{fontFamily: "poppins"}}>Rate Customer Support Help:</Typography>
        <Rating
          name="rating"
          value={feedback}
          onChange={(_, newValue) => setFeedback(newValue)}
          sx={{ color: 'cyan' }}
        />
        {feedback && (
          <Typography variant="body2" color="white" my={2}>
            Thank you for your feedback!
          </Typography>
        )}
      </Box>
    </Box>
  );
}