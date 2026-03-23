import { useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Avatar,
  Typography,
  Divider,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import useAuthStore from "@/stores/auth";
import useMessagesStore from "@/stores/message";
import { connectSocket, getSocket } from "@/utils/socket";
import DialogComponent from "@/components/DialogComponent";
import useProfilesStore from "@/stores/profile";

export default function WhatsAppUI() {
  const { logout } = useAuthStore();
  const [tab, setTab] = useState(0);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
  });
  // menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const open = Boolean(anchorEl);
  const {
    GetMessages,
    GetMessage,
    messages,
    messageDetails,
    CreateMessage,
    AddRealtimeMessage,
  } = useMessagesStore();
  const { fetchUser, user } = useAuthStore();
  const { GetProfile, UpdateProfile } = useProfilesStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    GetMessages();
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user?.uuid) return;

    const socket = connectSocket();

    socket.emit("join", user.uuid);

    return () => {
      socket.off("receive_message");
    };
  }, [user]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (msg) => {
      if (!selectedChat) return;

      if (
        msg.sender_uuid === selectedChat.uuid ||
        msg.receiver_uuid === selectedChat.uuid
      ) {
        AddRealtimeMessage(msg);
      }
    };

    socket.on("receive_message", handler);

    return () => socket.off("receive_message", handler);
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageDetails]);

  // console.log(selectedChat);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const openhandleProfile = async () => {
    const data = await GetProfile();
    setProfileForm({
      firstName: data.first_name,
      lastName: data.last_name,
      address: data.address,
      phoneNumber: data.phone_number,
    });
    setOpenProfileModal(true);
    handleMenuClose();
  };

  const closeHandleProfile = () => {
    setOpenProfileModal(false);
  };

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async () => {
    const data = {
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      address: profileForm.address,
      phoneNumber: profileForm.phoneNumber,
    };
    await UpdateProfile(data);
    closeHandleProfile();
  };

  const handleMessageDetail = async (chat) => {
    setSelectedChat(chat);
    await GetMessage(chat.uuid);
  };

  const handleCloseMessageDetail = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = () => {
    const data = {
      receiverUuid: selectedChat.uuid,
      message: message,
    };
    CreateMessage(data);
    setMessage("");
  };

  const handleLogout = async () => {
    await logout();
    handleMenuClose();
  };

  return (
    <>
      <Box sx={{ height: "100vh", bgcolor: "#f0f2f5", p: 2 }}>
        {/* CONTAINER (biar kayak WhatsApp Web) */}
        <Box
          sx={{
            maxWidth: "1400px",
            height: "100%",
            mx: "auto",
            bgcolor: "white",
            display: "flex",
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          {/* LEFT SIDE (FIX WIDTH) */}
          <Box
            sx={{
              width: { xs: "100%", md: 320 }, // mobile full, desktop fix
              borderRight: "1px solid #ddd",
              display:
                selectedChat && window.innerWidth < 768 ? "none" : "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER */}
            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Chats</Typography>

              <Avatar sx={{ cursor: "pointer" }} onClick={handleMenuOpen}>
                {user.username.charAt(0).toUpperCase()}
              </Avatar>

              <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                <MenuItem onClick={() => openhandleProfile()}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>

            {/* TABS */}
            <Tabs
              value={tab}
              onChange={(e, newValue) => setTab(newValue)}
              variant="fullWidth"
            >
              <Tab label="Chats" />
              <Tab label="Status" />
            </Tabs>

            <Divider />

            {/* CHAT LIST */}
            {tab === 0 && (
              <List sx={{ flex: 1, overflowY: "auto" }}>
                <ListItem
                  sx={{
                    cursor: "pointer",
                    bgcolor: "transparent",
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>
                    <AddIcon />
                  </Avatar>
                  <ListItemText
                    primary="New Chat"
                    secondary="Create new chat"
                  />
                </ListItem>
                <Divider />
                {messages.map((chat) => (
                  <ListItem
                    key={chat.id}
                    onClick={() => handleMessageDetail(chat)}
                    sx={{
                      cursor: "pointer",
                      bgcolor:
                        selectedChat?.id === chat.id
                          ? "#f0f0f0"
                          : "transparent",
                    }}
                  >
                    <Avatar sx={{ mr: 2 }}>
                      {chat.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={chat.username}
                      secondary={chat.message}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {tab === 1 && (
              <List sx={{ flex: 1, overflowY: "auto" }}>
                <ListItem
                  sx={{
                    cursor: "pointer",
                    bgcolor: "transparent",
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>
                    <AddIcon />
                  </Avatar>
                  <ListItemText
                    primary="New Status"
                    secondary="Create new status"
                  />
                </ListItem>
              </List>
            )}
          </Box>

          {/* RIGHT SIDE */}
          <Box
            sx={{
              flex: 1,
              display:
                !selectedChat && window.innerWidth < 768 ? "none" : "flex",
              flexDirection: "column",
            }}
          >
            {selectedChat ? (
              <>
                {/* HEADER */}
                <Box
                  sx={{ p: 2, borderBottom: "1px solid #ddd", display: "flex" }}
                >
                  <IconButton onClick={() => handleCloseMessageDetail()}>
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h6">{selectedChat.username}</Typography>
                </Box>

                {/* MESSAGES */}
                <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
                  {messageDetails?.map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent:
                          msg.sender_uuid === user.uuid
                            ? "flex-end"
                            : "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          bgcolor:
                            msg.sender_uuid === user.uuid ? "#DCF8C6" : "#eee",
                          maxWidth: "60%",
                        }}
                      >
                        {msg.message}
                      </Box>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                {/* INPUT */}
                <Box
                  sx={{ p: 2, borderTop: "1px solid #ddd", display: "flex" }}
                >
                  <TextField
                    fullWidth
                    placeholder="Ketik pesan..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <IconButton onClick={() => handleSendMessage()}>
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="text.secondary">
                  Pilih chat untuk mulai percakapan
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit A Profile Modal */}
      <DialogComponent
        open={openProfileModal}
        close={closeHandleProfile}
        title="Edit Profile"
        content={
          <>
            <form id="form-update-profile">
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    name="firstName"
                    id="firstName"
                    label="First Name"
                    type="text"
                    onChange={handleProfileChange}
                    value={profileForm.firstName}
                    fullWidth
                    variant="standard"
                    autoFocus
                    required
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    name="lastName"
                    id="lastName"
                    label="Last Name"
                    type="text"
                    onChange={handleProfileChange}
                    value={profileForm.lastName}
                    fullWidth
                    variant="standard"
                    autoFocus
                    required
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    name="address"
                    id="address"
                    label="Address"
                    type="text"
                    onChange={handleProfileChange}
                    value={profileForm.address}
                    fullWidth
                    variant="standard"
                    autoFocus
                    required
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    name="phoneNumber"
                    id="phoneNumber"
                    label="Phone Number"
                    type="text"
                    onChange={handleProfileChange}
                    value={profileForm.phoneNumber}
                    fullWidth
                    variant="standard"
                    autoFocus
                    required
                  />
                </Grid>
              </Grid>
            </form>
          </>
        }
        actions={
          <>
            <Button onClick={() => closeHandleProfile()}>Close</Button>
            <Button onClick={() => handleUpdateProfile()}>Update</Button>
          </>
        }
      />

      {/* Create Status Modal */}
    </>
  );
}
