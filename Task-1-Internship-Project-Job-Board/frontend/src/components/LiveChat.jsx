import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, User, ChevronLeft, Check, CheckCheck } from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin;

export default function LiveChat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedContactRef = useRef(null);

  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = sessionStorage.getItem('jb_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('LiveChat socket connected');
    });

    socket.on('new_message', (msg) => {
      setMessages((prev) => {
        const currentContact = selectedContactRef.current;
        if (currentContact && (msg.sender_id === currentContact.contact_id || msg.sender_id === currentContact._id)) {
          const exists = prev.some((m) => m._id === msg._id || m.id === msg.id);
          return exists ? prev : [...prev, msg];
        }
        return prev;
      });

      setContacts((prev) => {
        const currentContact = selectedContactRef.current;
        const existing = prev.find(
          (c) => c.contact_id === msg.sender_id || c._id === msg.sender_id
        );
        if (!existing) {
          loadContacts();
          return prev;
        }
        return prev.map((c) => {
          if (c.contact_id === msg.sender_id || c._id === msg.sender_id) {
            return { ...c, lastMsg: msg.text || msg.body, unread: currentContact?.contact_id !== msg.sender_id ? (c.unread || 0) + 1 : c.unread, time: new Date().toLocaleTimeString() };
          }
          return c;
        });
      });
    });

    socket.on('messages_read', ({ contactId }) => {
      setContacts((prev) =>
        prev.map((c) =>
          (c.contact_id === contactId || c._id === contactId) ? { ...c, unread: 0 } : c
        )
      );
      setMessages((prev) => {
        const currentContact = selectedContactRef.current;
        if (currentContact && (currentContact.contact_id === contactId || currentContact._id === contactId)) {
          return prev.map((m) => ({ ...m, read: true }));
        }
        return prev;
      });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [loadContacts]);

  const loadContacts = useCallback(async () => {
    setContactsLoading(true);
    try {
      const data = await apiGet('/messages');
      setContacts(data);
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setContactsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (contactId) => {
    setMessagesLoading(true);
    try {
      const data = await apiGet(`/messages/${contactId}`);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    loadMessages(contact.contact_id || contact._id);
    if (socketRef.current) {
      socketRef.current.emit('mark_read', { contactId: contact.contact_id || contact._id });
    }
    setContacts((prev) =>
      prev.map((c) =>
        (c.contact_id === contact.contact_id || c._id === contact._id) ? { ...c, unread: 0 } : c
      )
    );
  };

  const handleSend = (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || !selectedContact || !socketRef.current) return;

    const contactId = selectedContact.contact_id || selectedContact._id;

    socketRef.current.emit('private_message', { to: contactId, text });

    const tempMsg = {
      _id: Date.now().toString(),
      sender_id: user?.id || user?._id,
      body: text,
      text,
      created_at: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setInputText('');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: selectedContact ? '320px 1fr' : '320px 1fr',
      gap: 0,
      height: 'calc(100vh - 200px)',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(2, 6, 23, 0.6)',
      backdropFilter: 'blur(20px) saturate(180%)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
    }}>
      {/* Left Panel - Contacts */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.15)',
      }}>
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <MessageCircle size={18} color="#818cf8" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', margin: 0 }}>Messages</h3>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contactsLoading ? (
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ height: '60px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#64748b',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}>
              <MessageCircle size={32} style={{ opacity: 0.4 }} />
              <span>No conversations yet</span>
            </div>
          ) : (
            contacts.map((contact, idx) => {
              const isSelected = selectedContact?.contact_id === contact.contact_id || selectedContact?._id === contact._id;
              const unread = contact.unread;
              return (
                <motion.button
                  key={contact.contact_id || contact._id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleSelectContact(contact)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '1rem 1.25rem',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isSelected ? 'rgba(129, 140, 248, 0.12)' : 'transparent',
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {getInitials(contact.contact_name || contact.name || contact.company)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: unread > 0 ? 700 : 500, fontSize: '0.9rem', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {contact.contact_name || contact.name || contact.company || 'Unknown'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', flexShrink: 0 }}>
                        {contact.time || formatTime(contact.lastMsgTime)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: unread > 0 ? '#e2e8f0' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                      {contact.lastMsg || contact.last_message || 'No messages yet'}
                    </p>
                  </div>
                  {unread > 0 && (
                    <div style={{
                      minWidth: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#fff',
                      padding: '0 6px',
                      flexShrink: 0,
                      marginTop: '2px',
                      boxShadow: '0 0 12px rgba(129, 140, 248, 0.4)',
                    }}>
                      {unread > 99 ? '99+' : unread}
                    </div>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.08)',
      }}>
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0,0,0,0.1)',
            }}>
              <button
                onClick={() => setSelectedContact(null)}
                style={{
                  display: 'none',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}
                className="chat-back-btn"
              >
                <ChevronLeft size={18} />
              </button>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                {getInitials(selectedContact.contact_name || selectedContact.name || selectedContact.company)}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'white', margin: 0 }}>
                  {selectedContact.contact_name || selectedContact.name || selectedContact.company || 'Unknown'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  {selectedContact.role || selectedContact.title || ''}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {messagesLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px' }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)',
                        animation: 'pulse 1.5s infinite',
                        alignSelf: i % 2 === 0 ? 'flex-end' : 'flex-start',
                        width: i % 2 === 0 ? '60%' : '70%',
                      }} />
                    ))}
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  gap: '12px',
                }}>
                  <MessageCircle size={40} style={{ opacity: 0.3 }} />
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>No messages yet</p>
                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>Send a message to start the conversation</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isMine = msg.sender_id === user?.id || msg.sender_id === user?._id;
                    return (
                      <motion.div
                        key={msg._id || msg.id || idx}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                        style={{
                          maxWidth: '75%',
                          padding: '0.75rem 1rem',
                          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isMine
                            ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.2), rgba(99, 102, 241, 0.15))'
                            : 'rgba(255,255,255,0.04)',
                          border: isMine
                            ? '1px solid rgba(129, 140, 248, 0.15)'
                            : '1px solid rgba(255,255,255,0.06)',
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          position: 'relative',
                        }}
                      >
                        <p style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.5, margin: 0, wordBreak: 'break-word' }}>
                          {msg.body || msg.text}
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '4px',
                          marginTop: '6px',
                        }}>
                          <span style={{ color: '#64748b', fontSize: '0.65rem' }}>
                            {formatTime(msg.created_at || msg.timestamp)}
                          </span>
                          {isMine && (
                            msg.read ? (
                              <CheckCheck size={12} color="#818cf8" />
                            ) : (
                              <Check size={12} color="#64748b" />
                            )
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                gap: '10px',
                background: 'rgba(0,0,0,0.1)',
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.9rem',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#818cf8'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(129, 140, 248, 0.3)',
                  transition: 'box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(129, 140, 248, 0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 20px rgba(129, 140, 248, 0.3)'; }}
                disabled={!inputText.trim()}
              >
                <Send size={18} />
              </motion.button>
            </form>
          </>
        ) : (
          /* Empty State - No Contact Selected */
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            gap: '16px',
            padding: '2rem',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15), rgba(192, 132, 252, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(129, 140, 248, 0.1)',
            }}>
              <MessageCircle size={36} color="#818cf8" style={{ opacity: 0.6 }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: 'white', margin: '0 0 6px 0' }}>Your Messages</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, maxWidth: '240px' }}>
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
