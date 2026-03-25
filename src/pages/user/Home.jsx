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
import useUsersStore from "@/stores/user";
import useContactsStore from "@/stores/contact";

export default function Home() {
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
  const [openCreateChatModal, setOpenCreateChatModal] = useState(false);
  const [openCreateContactModal, setOpenCreateContactModal] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [searchContactUser, setSearchContactUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const listRef = useRef(null);
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
  const { GetUsersPaginate, setSearch, nextPage, resetAndFetch, users, loading } = useUsersStore()
  const { GetContacts, setSearchContact, nextPageContact, resetAndFetchContact, CreateContact, contacts } = useContactsStore()
  const messagesEndRef = useRef(null);

  useEffect(() => {
    GetMessages();
    fetchUser();
    GetUsersPaginate();
    GetContacts();
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

  // useEffect for contact modal
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(searchUser);
      resetAndFetch();
    }, 500);

    return () => clearTimeout(delay);
  }, [searchUser]);

  useEffect(() => {
    if (openCreateContactModal) {
      setSearch("");
      resetAndFetch();
    }
  }, [openCreateContactModal]);


  // useEffect for chats modal
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchContact(searchContactUser);
      resetAndFetchContact();
    }, 500);

    return () => clearTimeout(delay);
  }, [searchContactUser]);

  useEffect(() => {
    if (openCreateChatModal) {
      setSearchContact("");
      resetAndFetchContact();
    }
  }, [openCreateChatModal]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      nextPage();
    }
  };

  const handleScrollContact = () => {
    const el = listRef.current;
    if (!el) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      nextPageContact();
    }
  };

  const openHandleProfile = async () => {
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

  const openHandleCreateChat = async () => {
    setOpenCreateChatModal(true);
    handleMenuClose();
  };

  const closeHandleCreateChat = () => {
    setOpenCreateChatModal(false);
  };

  const openHandleCreateContact = async () => {
    setOpenCreateContactModal(true);
    handleMenuClose();
  };

  const closeHandleCreateContact = () => {
    setOpenCreateContactModal(false);
  };

  const handleSearchContactChange = (e) => {
    setSearchUser(e.target.value);
  }

  const handleCreateContact = async () => {
    const data = {
      contactUuid: selectedUser.uuid,
      fullName: `${selectedUser.first_name} ${selectedUser.last_name}`
    };
    await CreateContact(data);
    setOpenCreateContactModal(false);
  }

  const handleSearchChatChange = (e) => {
    setSearchContactUser(e.target.value);
  }

  const handleCreateChat = async () => {
    const data = {
      receiverUuid: selectedContact.contact_uuid,
      message: `Halo ${selectedContact.full_name} salam kenal. Namamu siapa ?` 
    };
    await CreateMessage(data);
    setOpenCreateChatModal(false);
    alert("Sukses! Chat baru telah berhasil dibuat!");
  }

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
                <MenuItem onClick={() => openHandleProfile()}>Profile</MenuItem>
                {/* <MenuItem onClick={() => openHandleCreateContact()}>Contacts</MenuItem> */}
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
              <Tab label="Contacts" />
            </Tabs>

            <Divider />

            {/* CHAT LIST */}
            {tab === 0 && (
              <List sx={{ flex: 1, overflowY: "auto" }}>
                <ListItem
                  sx={{
                    cursor: "pointer",
                    bgcolor: "lightblue",
                  }}
                  onClick={() => openHandleCreateChat()}
                >
                  <Avatar sx={{ mr: 2, bgcolor: "lightgreen", border: "1px solid black" }}>
                    <AddIcon sx={{ color: "black" }} />
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
                      primary={`${chat.first_name} ${chat.last_name}`}
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
                    bgcolor: "lightblue",
                  }}
                  onClick={() => openHandleCreateContact()}
                >
                  <Avatar sx={{ mr: 2, bgcolor: "lightgreen", border: "1px solid black" }}>
                    <AddIcon sx={{ color: "black" }} />
                  </Avatar>
                  <ListItemText
                    primary="New Contact"
                    secondary="Create add contact"
                  />
                </ListItem>
                <Divider />
                {contacts.map((contact) => (
                  <ListItem
                    key={contact.contact_uuid}
                    sx={{
                      cursor: "pointer",
                      bgcolor: "transparent",
                    }}
                  >
                    <Avatar sx={{ mr: 2 }}>
                      {contact.full_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <ListItemText
                      primary={contact.full_name}
                    />
                  </ListItem>
                ))}
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
                  <Typography variant="h6">{`${selectedChat.first_name} ${selectedChat.last_name}`}</Typography>
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

      {/* Create Chat Modal */}
      <DialogComponent
        open={openCreateChatModal}
        close={closeHandleCreateChat}
        title="Create New Chat"
        content={
          <>
            <form id="form-create-chat">
              <TextField
                name="searchUser"
                id="searchUser"
                label="Search"
                type="text"
                fullWidth
                variant="standard"
                placeholder="search a user from your contact"
                autoFocus
                required
                sx={{ position: "sticky" }}
                onChange={handleSearchChatChange}
                value={searchContactUser}
              />
            </form>
            <List
              ref={listRef}
              onScroll={handleScrollContact}
              sx={{ flex: 1, overflowY: "auto", maxHeight: 300 }}
            >
              {contacts.map((contact) => (
                <ListItem
                  key={contact.contact_uuid}
                  onClick={() => setSelectedContact(contact)}
                  sx={{
                    cursor: "pointer",
                    bgcolor:
                      selectedContact?.contact_uuid === contact.contact_uuid ? "#e3f2fd" : "transparent",
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>
                    {contact.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={`${contact.full_name}`}
                  />
                </ListItem>
              ))}

              {/* {loading && (
                <Typography textAlign="center" sx={{ p: 1 }}>
                  Loading...
                </Typography>
              )} */}

              {!loading && contacts.length === 0 && (
                <Typography textAlign="center" sx={{ p: 2 }}>
                  No contact found
                </Typography>
              )}
            </List>
          </>
        }
        actions={
          <>
            <Button onClick={() => closeHandleCreateChat()}>Close</Button>
            <Button onClick={() => handleCreateChat()}>Add</Button>
          </>
        }
      />

      {/* Create Contact Modal */}
      <DialogComponent
        open={openCreateContactModal}
        close={closeHandleCreateContact}
        title="Create New Contact"
        content={
          <>
            <form id="form-create-contact">
              <TextField
                name="searchUser"
                id="searchUser"
                label="Search"
                type="text"
                fullWidth
                variant="standard"
                placeholder="search a user"
                autoFocus
                required
                sx={{ position: "sticky" }}
                onChange={handleSearchContactChange}
                value={searchUser}
              />
            </form>
            <List
              ref={listRef}
              onScroll={handleScroll}
              sx={{ flex: 1, overflowY: "auto", maxHeight: 300 }}
            >
              {users.map((user) => (
                <ListItem
                  key={user.uuid}
                  onClick={() => setSelectedUser(user)}
                  sx={{
                    cursor: "pointer",
                    bgcolor:
                      selectedUser?.uuid === user.uuid ? "#e3f2fd" : "transparent",
                  }}
                >
                  <Avatar sx={{ mr: 2 }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <ListItemText
                    primary={user.username}
                    secondary={`${user.first_name} ${user.last_name}`}
                  />
                </ListItem>
              ))}

              {loading && (
                <Typography textAlign="center" sx={{ p: 1 }}>
                  Loading...
                </Typography>
              )}

              {!loading && users.length === 0 && (
                <Typography textAlign="center" sx={{ p: 2 }}>
                  No users found
                </Typography>
              )}
            </List>
          </>
        }
        actions={
          <>
            <Button onClick={() => closeHandleCreateContact()}>Close</Button>
            <Button onClick={() => handleCreateContact()}>Add</Button>
          </>
        }
      />

      {/* Create Status Modal */}
    </>
  );
}
