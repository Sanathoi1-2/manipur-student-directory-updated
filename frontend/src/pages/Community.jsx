import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import api from "../services/api";


// =====================================================
// CHANNELS
// =====================================================

const channels = [
    {
        id: "general",
        label: "General",
        description: "Campus-wide conversation",
        icon: "💬"
    },
    {
        id: "cse",
        label: "CSE",
        description: "Computer Science & Engineering",
        icon: "💻"
    },
    {
        id: "freshers",
        label: "Freshers",
        description: "For new students",
        icon: "🎓"
    }
];


// =====================================================
// FILE SETTINGS
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024;


// =====================================================
// COMMUNITY
// =====================================================

function Community() {

    const [channel, setChannel] =
        useState("general");

    const [messages, setMessages] =
        useState([]);

    const [name, setName] =
        useState(
            localStorage.getItem(
                "community_name"
            ) || ""
        );

    const [text, setText] =
        useState("");

    const [selectedFile, setSelectedFile] =
        useState(null);

    const [replyingTo, setReplyingTo] =
        useState(null);

    const [editingMessage, setEditingMessage] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [sending, setSending] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [editingId, setEditingId] =
        useState(null);

    const [error, setError] =
        useState("");

    const bottomRef =
        useRef(null);

    const messagesContainerRef =
        useRef(null);

    const fileInputRef =
        useRef(null);

    const composerInputRef =
        useRef(null);

    const shouldScrollRef =
        useRef(true);


    // =====================================================
    // ADMIN
    // =====================================================

    const admin =
        useMemo(() => {

            try {

                const storedAdmin =
                    localStorage.getItem("admin");

                if (!storedAdmin) {
                    return null;
                }

                return JSON.parse(
                    storedAdmin
                );

            } catch {

                return null;

            }

        }, []);


    const isAdmin =
        admin?.role === "admin";


    // =====================================================
    // ACTIVE CHANNEL
    // =====================================================

    const activeChannel =
        useMemo(
            () =>
                channels.find(
                    item =>
                        item.id === channel
                ),
            [channel]
        );


    // =====================================================
    // LOAD MESSAGES
    // =====================================================

    async function loadMessages(
        silent = false
    ) {

        try {

            if (!silent) {
                setLoading(true);
            }

            const response =
                await api.get(
                    "/community/messages",
                    {
                        params: {
                            channel,
                            limit: 100
                        }
                    }
                );


            const newMessages =
                Array.isArray(
                    response.data?.messages
                )
                    ? response.data.messages
                    : [];


            setMessages(
                newMessages
            );

            setError("");

        } catch (err) {

            console.error(
                "COMMUNITY LOAD ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load community messages."
            );

        } finally {

            if (!silent) {
                setLoading(false);
            }

        }

    }


    // =====================================================
    // CHANNEL / AUTO REFRESH
    // =====================================================

    useEffect(() => {

        shouldScrollRef.current = true;

        loadMessages(false);


        const timer =
            setInterval(
                () => {

                    /*
                     * Silent refresh MUST NOT force
                     * the chat to jump to the bottom.
                     */
                    loadMessages(true);

                },
                5000
            );


        return () =>
            clearInterval(timer);

    }, [channel]);


    // =====================================================
    // AUTO SCROLL
    //
    // Only scroll when explicitly requested:
    //
    // - channel change
    // - first load
    // - successful send
    //
    // Background polling never forces scroll.
    // =====================================================

    useEffect(() => {

        if (
            !loading &&
            shouldScrollRef.current
        ) {

            requestAnimationFrame(() => {

                const container =
                    messagesContainerRef.current;

                if (container) {

                    container.scrollTo({
                        top:
                            container.scrollHeight,
                        behavior: "smooth"
                    });

                }

            });


            shouldScrollRef.current =
                false;

        }

    }, [messages, loading]);


    // =====================================================
    // CHANNEL CHANGE
    // =====================================================

    function handleChannelChange(
        newChannel
    ) {

        if (
            newChannel === channel
        ) {
            return;
        }

        shouldScrollRef.current =
            true;

        setReplyingTo(null);

        setEditingMessage(null);

        setText("");

        removeSelectedFile();

        setMessages([]);

        setChannel(
            newChannel
        );

    }


    // =====================================================
    // SELECT FILE
    // =====================================================

    function handleFileChange(
        event
    ) {

        const file =
            event.target.files?.[0];


        if (!file) {
            return;
        }


        if (
            file.size >
            MAX_FILE_SIZE
        ) {

            setError(
                "File is too large. Maximum file size is 10 MB."
            );

            event.target.value =
                "";

            setSelectedFile(
                null
            );

            return;

        }


        setError("");

        setSelectedFile(
            file
        );

    }


    // =====================================================
    // REMOVE FILE
    // =====================================================

    function removeSelectedFile() {

        setSelectedFile(
            null
        );


        if (
            fileInputRef.current
        ) {

            fileInputRef.current.value =
                "";

        }

    }


    // =====================================================
    // FORMAT FILE SIZE
    // =====================================================

    function formatFileSize(
        bytes
    ) {

        if (!bytes) {
            return "0 KB";
        }


        if (
            bytes <
            1024
        ) {

            return `${bytes} B`;

        }


        if (
            bytes <
            1024 * 1024
        ) {

            return `${(
                bytes / 1024
            ).toFixed(1)} KB`;

        }


        return `${(
            bytes /
            (1024 * 1024)
        ).toFixed(1)} MB`;

    }


    // =====================================================
    // FILE URL
    // =====================================================

    function getFileUrl(
        filePath
    ) {

        if (!filePath) {
            return "";
        }


        if (
            filePath.startsWith(
                "http://"
            ) ||
            filePath.startsWith(
                "https://"
            )
        ) {

            return filePath;

        }


        const apiBaseURL =
            api.defaults?.baseURL ||
            "";


        const serverBaseURL =
            apiBaseURL
                .replace(
                    /\/api\/?$/,
                    ""
                )
                .replace(
                    /\/$/,
                    ""
                );


        return `${serverBaseURL}/${filePath.replace(
            /^\//,
            ""
        )}`;

    }


    // =====================================================
    // FILE ICON
    // =====================================================

    function getFileIcon(
        mime,
        fileName
    ) {

        const type =
            String(
                mime || ""
            ).toLowerCase();


        const name =
            String(
                fileName || ""
            ).toLowerCase();


        if (
            type.includes("pdf") ||
            name.endsWith(".pdf")
        ) {

            return "📕";

        }


        if (
            type.includes("word") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {

            return "📘";

        }


        if (
            type.includes("excel") ||
            type.includes("spreadsheet") ||
            name.endsWith(".xls") ||
            name.endsWith(".xlsx")
        ) {

            return "📗";

        }


        if (
            type.includes("zip") ||
            name.endsWith(".zip")
        ) {

            return "🗜️";

        }


        if (
            type.startsWith("image/")
        ) {

            return "🖼️";

        }


        if (
            type.startsWith("text/")
        ) {

            return "📄";

        }


        return "📎";

    }


    // =====================================================
    // CHECK IMAGE
    // =====================================================

    function isImageFile(
        mime,
        fileName
    ) {

        const type =
            String(
                mime || ""
            ).toLowerCase();


        const name =
            String(
                fileName || ""
            ).toLowerCase();


        return (
            type.startsWith("image/") ||
            /\.(jpg|jpeg|png|gif|webp)$/i.test(
                name
            )
        );

    }


    // =====================================================
    // START REPLY
    // =====================================================

    function startReply(
        item
    ) {

        setEditingMessage(null);

        setReplyingTo(item);

        requestAnimationFrame(() => {

            composerInputRef.current?.focus();

        });

    }


    // =====================================================
    // CANCEL REPLY
    // =====================================================

    function cancelReply() {

        setReplyingTo(null);

        requestAnimationFrame(() => {

            composerInputRef.current?.focus();

        });

    }


    // =====================================================
    // START EDIT
    // =====================================================

    function startEdit(
        item
    ) {

        /*
         * Editing is intentionally text-only.
         *
         * We do not replace or remove an existing
         * attachment during editing.
         */

        setReplyingTo(null);

        setEditingMessage(item);

        setText(
            item.message || ""
        );

        removeSelectedFile();

        requestAnimationFrame(() => {

            composerInputRef.current?.focus();

        });

    }


    // =====================================================
    // CANCEL EDIT
    // =====================================================

    function cancelEdit() {

        setEditingMessage(null);

        setText("");

        removeSelectedFile();

        requestAnimationFrame(() => {

            composerInputRef.current?.focus();

        });

    }


    // =====================================================
    // SEND / EDIT MESSAGE
    // =====================================================

    async function handleSubmit(
        event
    ) {

        event.preventDefault();


        if (sending) {
            return;
        }


        const cleanName =
            name.trim();


        const cleanText =
            text.trim();


        // =================================================
        // NAME
        // =================================================

        if (!cleanName) {

            setError(
                "Please enter your name."
            );

            return;

        }


        if (
            cleanName.length < 2
        ) {

            setError(
                "Your name must contain at least 2 characters."
            );

            return;

        }


        // =================================================
        // EDIT MODE
        // =================================================

        if (editingMessage) {

            if (!cleanText) {

                setError(
                    "Edited message cannot be empty."
                );

                return;

            }


            try {

                setSending(true);

                setEditingId(
                    editingMessage.id
                );

                setError("");


                /*
                 * IMPORTANT:
                 *
                 * There is NO /edit route here.
                 *
                 * This uses the normal resource route:
                 *
                 * PATCH /community/messages/:id
                 *
                 * If your backend does not currently have
                 * PATCH support, the backend needs that route.
                 */

                await api.patch(
                    `/community/messages/${editingMessage.id}`,
                    {
                        message: cleanText
                    }
                );


                setText("");

                setEditingMessage(null);

                shouldScrollRef.current =
                    false;


                await loadMessages(
                    true
                );

            } catch (err) {

                console.error(
                    "EDIT MESSAGE ERROR:",
                    err
                );


                if (
                    err.response?.status === 404
                ) {

                    setError(
                        "Message editing is not enabled on the server yet. Add PATCH /community/messages/:id to your backend."
                    );

                } else {

                    setError(
                        err.response?.data?.message ||
                        "Unable to edit message."
                    );

                }

            } finally {

                setSending(false);

                setEditingId(null);

            }


            return;

        }


        // =================================================
        // NORMAL MESSAGE / REPLY
        // =================================================

        const hasText =
            cleanText.length > 0;


        const hasFile =
            selectedFile instanceof File;


        if (
            !hasText &&
            !hasFile
        ) {

            setError(
                "Write a message or attach a file."
            );

            return;

        }


        if (
            hasFile &&
            selectedFile.size >
                MAX_FILE_SIZE
        ) {

            setError(
                "File is too large. Maximum file size is 10 MB."
            );

            return;

        }


        try {

            setSending(
                true
            );

            setError("");


            localStorage.setItem(
                "community_name",
                cleanName
            );


            const formData =
                new FormData();


            formData.append(
                "channel",
                channel
            );


            formData.append(
                "display_name",
                cleanName
            );


            formData.append(
                "message",
                hasText
                    ? cleanText
                    : ""
            );


            // =================================================
            // REPLY DATA
            //
            // IMPORTANT:
            //
            // The reply is attached to the SAME message
            // request.
            //
            // There is NO separate reply route.
            // =================================================

            if (replyingTo) {

                formData.append(
                    "reply_to_id",
                    String(
                        replyingTo.id
                    )
                );


                formData.append(
                    "reply_to_name",
                    replyingTo.display_name ||
                    ""
                );


                formData.append(
                    "reply_to_message",
                    replyingTo.message ||
                    ""
                );


                formData.append(
                    "reply_to_file_name",
                    replyingTo.file_name ||
                    ""
                );


                formData.append(
                    "reply_to_file_mime",
                    replyingTo.file_mime ||
                    ""
                );


                formData.append(
                    "reply_to_file_url",
                    replyingTo.file_url ||
                    replyingTo.file_path ||
                    ""
                );

            }


            // =================================================
            // FILE
            // =================================================

            if (hasFile) {

                formData.append(
                    "file",
                    selectedFile,
                    selectedFile.name
                );

            }


            // =================================================
            // SEND
            // =================================================

            const response =
                await api.post(
                    "/community/messages",
                    formData
                );


            console.log(
                "COMMUNITY SEND SUCCESS:",
                response.data
            );


            setText("");

            removeSelectedFile();

            setReplyingTo(null);


            /*
             * New message should appear at the bottom.
             */

            shouldScrollRef.current =
                true;


            await loadMessages(
                true
            );


            /*
             * After scrolling, keep the composer focused.
             * This means the user can immediately type again.
             */

            requestAnimationFrame(() => {

                composerInputRef.current?.focus();

            });

        } catch (err) {

            console.error(
                "SEND MESSAGE ERROR:",
                err
            );


            console.error(
                "SEND MESSAGE RESPONSE:",
                err.response?.data
            );


            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to send message."
            );

        } finally {

            setSending(
                false
            );

        }

    }


    // =====================================================
    // DELETE MESSAGE
    // =====================================================

    async function handleDelete(
        messageId
    ) {

        if (!messageId) {
            return;
        }


        const confirmed =
            window.confirm(
                "Delete this community message?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setDeletingId(
                messageId
            );

            setError("");


            await api.delete(
                `/community/messages/${messageId}`
            );


            setMessages(
                current =>
                    current.filter(
                        item =>
                            item.id !==
                            messageId
                    )
            );


            if (
                replyingTo?.id ===
                messageId
            ) {

                setReplyingTo(
                    null
                );

            }

        } catch (err) {

            console.error(
                "DELETE MESSAGE ERROR:",
                err
            );


            setError(
                err.response?.data?.message ||
                "Unable to delete message."
            );

        } finally {

            setDeletingId(
                null
            );

        }

    }


    // =====================================================
    // FORMAT TIME
    // =====================================================

    function formatTime(
        date
    ) {

        try {

            return new Date(
                date
            ).toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

        } catch {

            return "";

        }

    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(
        date
    ) {

        try {

            return new Date(
                date
            ).toLocaleDateString(
                [],
                {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );

        } catch {

            return "";

        }

    }


    // =====================================================
    // AVATAR
    // =====================================================

    function getInitial(
        displayName
    ) {

        return (
            displayName
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() ||
            "?"
        );

    }


    // =====================================================
    // AVATAR COLOR
    // =====================================================

    function getAvatarClass(
        displayName
    ) {

        const value =
            String(
                displayName || "user"
            );


        let hash = 0;


        for (
            let index = 0;
            index < value.length;
            index++
        ) {

            hash =
                value.charCodeAt(index) +
                ((hash << 5) - hash);

        }


        return `avatar-color-${Math.abs(hash) % 6}`;

    }


    // =====================================================
    // REPLY PREVIEW DATA
    // =====================================================

    function getReplyData(
        item
    ) {

        /*
         * Supports several possible backend naming
         * conventions so the UI is tolerant.
         */

        const replyId =
            item.reply_to_id ??
            item.replyToId ??
            item.reply_message_id ??
            item.parent_message_id ??
            null;


        const replyName =
            item.reply_to_name ??
            item.replyToName ??
            item.reply_display_name ??
            item.parent_display_name ??
            "";


        const replyMessage =
            item.reply_to_message ??
            item.replyToMessage ??
            item.reply_message ??
            item.parent_message ??
            "";


        const replyFileName =
            item.reply_to_file_name ??
            item.replyToFileName ??
            item.reply_file_name ??
            "";


        const replyFileUrl =
            item.reply_to_file_url ??
            item.replyToFileUrl ??
            item.reply_file_url ??
            "";


        if (
            !replyId &&
            !replyMessage &&
            !replyName &&
            !replyFileName
        ) {

            return null;

        }


        return {
            id: replyId,
            name: replyName,
            message: replyMessage,
            fileName: replyFileName,
            fileUrl: replyFileUrl
        };

    }


    // =====================================================
    // RENDER REPLY ATTACHMENT
    // =====================================================

    function renderReplyPreview(
        item
    ) {

        const reply =
            getReplyData(item);


        if (!reply) {
            return null;
        }


        return (

            <div className="message-reply-preview">

                <div className="message-reply-line"></div>


                <div className="message-reply-content">

                    <div className="message-reply-top">

                        <span className="message-reply-icon">
                            ↩
                        </span>


                        <strong>
                            Replying to{" "}
                            {reply.name ||
                                "Student"}
                        </strong>

                    </div>


                    {reply.message && (

                        <p>
                            {reply.message}
                        </p>

                    )}


                    {!reply.message &&
                        reply.fileName && (

                            <span className="reply-file-reference">
                                📎 {reply.fileName}
                            </span>

                        )}

                </div>

            </div>

        );

    }


    // =====================================================
    // RENDER ATTACHMENT
    // =====================================================

    function renderAttachment(
        item
    ) {

        const filePath =
            item.file_url ||
            item.file_path;


        if (!filePath) {
            return null;
        }


        const fileUrl =
            getFileUrl(
                filePath
            );


        const image =
            isImageFile(
                item.file_mime,
                item.file_name
            );


        // =================================================
        // IMAGE
        // =================================================

        if (image) {

            return (

                <div className="community-image-attachment">

                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="community-image-link"
                    >

                        <img
                            src={fileUrl}
                            alt={
                                item.file_name ||
                                "Shared image"
                            }
                            className="community-image-preview"
                            loading="lazy"
                        />

                    </a>


                    <div className="community-image-footer">

                        <div className="community-image-details">

                            <span>
                                🖼️
                            </span>


                            <div>

                                <strong
                                    title={
                                        item.file_name ||
                                        "Image"
                                    }
                                >
                                    {
                                        item.file_name ||
                                        "Image"
                                    }
                                </strong>


                                <small>
                                    {item.file_size
                                        ? formatFileSize(
                                            Number(
                                                item.file_size
                                            )
                                        )
                                        : "Image"}
                                </small>

                            </div>

                        </div>


                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="community-file-open"
                        >
                            View
                        </a>

                    </div>

                </div>

            );

        }


        // =================================================
        // DOCUMENT
        // =================================================

        return (

            <div className="community-file-attachment">

                <div
                    className={
                        `community-file-icon ${
                            item.file_mime?.includes("pdf")
                                ? "pdf"
                                : ""
                        }`
                    }
                >

                    {getFileIcon(
                        item.file_mime,
                        item.file_name
                    )}

                </div>


                <div className="community-file-info">

                    <strong
                        title={
                            item.file_name ||
                            "Attached file"
                        }
                    >
                        {
                            item.file_name ||
                            "Attached file"
                        }
                    </strong>


                    <span>

                        {item.file_size
                            ? formatFileSize(
                                Number(
                                    item.file_size
                                )
                            )
                            : "File"}

                    </span>

                </div>


                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="community-file-open"
                >
                    Open
                </a>

            </div>

        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <main className="community-page">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="community-hero">

                <div className="community-hero-glow"></div>


                <div className="community-hero-content">

                    <div className="community-hero-icon">
                        💬
                    </div>


                    <div>

                        <span className="community-eyebrow">
                            MANIPUR STUDENT COMMUNITY
                        </span>


                        <h1>
                            Student Community
                        </h1>


                        <p>
                            Connect, discuss and share
                            with students across campus.
                        </p>

                    </div>

                </div>


                <div className="community-online">

                    <span className="online-indicator"></span>

                    <span>
                        Community Online
                    </span>

                </div>

            </section>


            {/* =================================================
                MAIN
            ================================================= */}

            <section className="community-container">


                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <aside className="community-sidebar">

                    <div className="community-sidebar-title">

                        <div>

                            <span>
                                COMMUNITIES
                            </span>

                            <h3>
                                Groups
                            </h3>

                        </div>


                        <span className="group-count">
                            {channels.length}
                        </span>

                    </div>


                    <div className="community-channels">

                        {channels.map(
                            item => (

                                <button
                                    key={item.id}
                                    type="button"
                                    className={
                                        `community-channel ${
                                            channel === item.id
                                                ? "active"
                                                : ""
                                        }`
                                    }
                                    onClick={() =>
                                        handleChannelChange(
                                            item.id
                                        )
                                    }
                                >

                                    <span className="channel-icon">
                                        {item.icon}
                                    </span>


                                    <span className="channel-info">

                                        <strong>
                                            {item.label}
                                        </strong>


                                        <small>
                                            {item.description}
                                        </small>

                                    </span>


                                    {channel === item.id && (

                                        <span className="channel-active-dot">

                                            <span></span>

                                        </span>

                                    )}

                                </button>

                            )
                        )}

                    </div>


                    <div className="community-info-card">

                        <div className="community-info-icon">
                            🛡️
                        </div>


                        <div>

                            <strong>
                                Keep it respectful
                            </strong>


                            <p>
                                Help keep the community
                                friendly and useful
                                for everyone.
                            </p>

                        </div>

                    </div>


                    {isAdmin && (

                        <div className="admin-community-card">

                            <div className="admin-community-icon">
                                🛡️
                            </div>


                            <div>

                                <strong>
                                    Admin Mode
                                </strong>


                                <p>
                                    You can remove
                                    inappropriate
                                    messages.
                                </p>

                            </div>

                        </div>

                    )}

                </aside>


                {/* =================================================
                    CHAT
                ================================================= */}

                <section className="community-chat">


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <header className="community-chat-header">

                        <div className="chat-channel-title">

                            <div className="chat-channel-icon">
                                {activeChannel?.icon}
                            </div>


                            <div>

                                <div className="chat-title-row">

                                    <h2>
                                        {activeChannel?.label}
                                    </h2>


                                    <span className="chat-live-badge">

                                        <span></span>

                                        Live

                                    </span>

                                </div>


                                <p>
                                    {activeChannel?.description}
                                </p>

                            </div>

                        </div>


                        <div className="chat-member-info">

                            <span className="member-dot"></span>

                            Students

                        </div>

                    </header>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div className="community-error">

                            <div className="community-error-icon">
                                ⚠️
                            </div>


                            <div className="community-error-text">

                                <strong>
                                    Something went wrong
                                </strong>


                                <span>
                                    {error}
                                </span>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setError("")
                                }
                                aria-label="Close error"
                            >
                                ×
                            </button>

                        </div>

                    )}


                    {/* =================================================
                        MESSAGES
                    ================================================= */}

                    <div
                        ref={messagesContainerRef}
                        className="community-messages"
                    >

                        {loading ? (

                            <div className="community-loading">

                                <div className="loading-spinner"></div>


                                <h3>
                                    Loading community
                                </h3>


                                <p>
                                    Getting the latest conversations...
                                </p>

                            </div>

                        ) : messages.length === 0 ? (

                            <div className="community-empty">

                                <div className="empty-icon">
                                    💬
                                </div>


                                <h3>
                                    Start the conversation
                                </h3>


                                <p>
                                    There are no messages
                                    in this group yet.
                                    Be the first to say hello!
                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        composerInputRef.current?.focus()
                                    }
                                >
                                    Say hello 👋
                                </button>

                            </div>

                        ) : (

                            <>

                                <div className="message-date-label">

                                    <span></span>

                                    {formatDate(
                                        messages[0]?.created_at
                                    )}

                                    <span></span>

                                </div>


                                {messages.map(
                                    item => {

                                        const reply =
                                            getReplyData(item);

                                        return (

                                            <article
                                                className="community-message"
                                                key={item.id}
                                            >

                                                <div
                                                    className={
                                                        `message-avatar ${
                                                            getAvatarClass(
                                                                item.display_name
                                                            )
                                                        }`
                                                    }
                                                >

                                                    {getInitial(
                                                        item.display_name
                                                    )}

                                                </div>


                                                <div className="message-content">

                                                    <div className="message-header">

                                                        <div className="message-author">

                                                            <strong>
                                                                {
                                                                    item.display_name
                                                                }
                                                            </strong>

                                                        </div>


                                                        <time
                                                            dateTime={
                                                                item.created_at
                                                            }
                                                        >
                                                            {formatTime(
                                                                item.created_at
                                                            )}
                                                        </time>

                                                    </div>


                                                    <div className="message-bubble">

                                                        {reply && (
                                                            renderReplyPreview(
                                                                item
                                                            )
                                                        )}


                                                        {item.message && (

                                                            <p>
                                                                {
                                                                    item.message
                                                                }
                                                            </p>

                                                        )}


                                                        {renderAttachment(
                                                            item
                                                        )}

                                                    </div>


                                                    <div className="message-actions">

                                                        <button
                                                            type="button"
                                                            className="message-action-btn reply"
                                                            onClick={() =>
                                                                startReply(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            ↩ Reply
                                                        </button>


                                                        {isAdmin && (

                                                            <button
                                                                type="button"
                                                                className="message-action-btn edit"
                                                                onClick={() =>
                                                                    startEdit(
                                                                        item
                                                                    )
                                                                }
                                                                disabled={
                                                                    editingId ===
                                                                    item.id
                                                                }
                                                            >
                                                                ✏️ Edit
                                                            </button>

                                                        )}


                                                        {isAdmin && (

                                                            <button
                                                                type="button"
                                                                className="message-action-btn delete"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        item.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    item.id
                                                                }
                                                            >

                                                                {deletingId ===
                                                                item.id
                                                                    ? "Deleting..."
                                                                    : "🗑️ Delete"}

                                                            </button>

                                                        )}

                                                    </div>

                                                </div>

                                            </article>

                                        );

                                    }
                                )}

                            </>

                        )}


                        <div
                            ref={bottomRef}
                        />

                    </div>


                    {/* =================================================
                        COMPOSER
                    ================================================= */}

                    <div className="community-composer-wrapper">


                        {/* =================================================
                            REPLY / EDIT BAR
                        ================================================= */}

                        {(replyingTo ||
                            editingMessage) && (

                            <div className="composer-context-bar">

                                <div className="composer-context-icon">

                                    {editingMessage
                                        ? "✏️"
                                        : "↩"}

                                </div>


                                <div className="composer-context-content">

                                    <strong>

                                        {editingMessage
                                            ? "Editing message"
                                            : `Replying to ${
                                                replyingTo?.display_name ||
                                                "Student"
                                            }`}

                                    </strong>


                                    <span>

                                        {editingMessage
                                            ? (
                                                editingMessage.message ||
                                                "Attachment message"
                                            )
                                            : (
                                                replyingTo?.message ||
                                                replyingTo?.file_name ||
                                                "Attachment"
                                            )}

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    className="composer-context-close"
                                    onClick={
                                        editingMessage
                                            ? cancelEdit
                                            : cancelReply
                                    }
                                    aria-label={
                                        editingMessage
                                            ? "Cancel editing"
                                            : "Cancel reply"
                                    }
                                >
                                    ×
                                </button>

                            </div>

                        )}


                        <form
                            className="community-composer"
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* =================================================
                                NAME
                            ================================================= */}

                            <div className="composer-name">

                                <div
                                    className={
                                        `composer-avatar ${
                                            getAvatarClass(
                                                name
                                            )
                                        }`
                                    }
                                >

                                    {getInitial(
                                        name
                                    )}

                                </div>


                                <input
                                    value={name}
                                    onChange={
                                        event =>
                                            setName(
                                                event.target.value
                                            )
                                    }
                                    placeholder="Your name"
                                    maxLength={60}
                                    autoComplete="name"
                                />

                            </div>


                            {/* =================================================
                                MESSAGE
                            ================================================= */}

                            <div className="composer-message">

                                <input
                                    ref={
                                        composerInputRef
                                    }
                                    value={text}
                                    onChange={
                                        event =>
                                            setText(
                                                event.target.value
                                            )
                                    }
                                    placeholder={
                                        editingMessage
                                            ? "Edit your message..."
                                            : `Write a message in ${activeChannel?.label}...`
                                    }
                                    maxLength={1000}
                                    autoComplete="off"
                                />


                                {/* =================================================
                                    FILE PREVIEW
                                ================================================= */}

                                {selectedFile && (

                                    <div className="selected-file-preview">

                                        {isImageFile(
                                            selectedFile.type,
                                            selectedFile.name
                                        ) ? (

                                            <div className="selected-file-image-preview">

                                                <img
                                                    src={
                                                        URL.createObjectURL(
                                                            selectedFile
                                                        )
                                                    }
                                                    alt="Selected file preview"
                                                />

                                            </div>

                                        ) : (

                                            <div className="selected-file-icon">

                                                {getFileIcon(
                                                    selectedFile.type,
                                                    selectedFile.name
                                                )}

                                            </div>

                                        )}


                                        <div className="selected-file-details">

                                            <strong
                                                title={
                                                    selectedFile.name
                                                }
                                            >
                                                {
                                                    selectedFile.name
                                                }
                                            </strong>


                                            <small>
                                                {formatFileSize(
                                                    selectedFile.size
                                                )}
                                            </small>

                                        </div>


                                        <button
                                            type="button"
                                            className="selected-file-remove"
                                            onClick={
                                                removeSelectedFile
                                            }
                                            disabled={
                                                sending
                                            }
                                            aria-label="Remove selected file"
                                        >
                                            ×
                                        </button>

                                    </div>

                                )}


                                {/* =================================================
                                    ACTIONS
                                ================================================= */}

                                <div className="composer-actions">

                                    <div className="composer-left-actions">

                                        <input
                                            ref={
                                                fileInputRef
                                            }
                                            type="file"
                                            hidden
                                            onChange={
                                                handleFileChange
                                            }
                                            accept="
                                                image/jpeg,
                                                image/png,
                                                image/gif,
                                                image/webp,
                                                application/pdf,
                                                text/plain,
                                                application/msword,
                                                application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                                                application/vnd.ms-excel,
                                                application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                                                application/zip,
                                                application/x-zip-compressed
                                            "
                                        />


                                        {!editingMessage && (

                                            <button
                                                type="button"
                                                className="community-attach-btn"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                disabled={
                                                    sending
                                                }
                                            >

                                                <span className="attach-icon">
                                                    📎
                                                </span>


                                                <span>
                                                    Attach
                                                </span>

                                            </button>

                                        )}


                                        <span className="character-count">
                                            {text.length}/1000
                                        </span>

                                    </div>


                                    <div className="composer-submit-actions">

                                        {editingMessage && (

                                            <button
                                                type="button"
                                                className="community-cancel-edit-btn"
                                                onClick={
                                                    cancelEdit
                                                }
                                                disabled={
                                                    sending
                                                }
                                            >
                                                Cancel
                                            </button>

                                        )}


                                        <button
                                            type="submit"
                                            className="community-send-btn"
                                            disabled={
                                                sending ||
                                                !name.trim() ||
                                                (
                                                    !text.trim() &&
                                                    !selectedFile &&
                                                    !editingMessage
                                                )
                                            }
                                        >

                                            {sending ? (

                                                <span className="send-loading">

                                                    <span></span>

                                                    {editingMessage
                                                        ? "Saving..."
                                                        : "Sending..."}

                                                </span>

                                            ) : (

                                                <>

                                                    <span>
                                                        {editingMessage
                                                            ? "Save"
                                                            : "Send"}
                                                    </span>


                                                    <span className="send-icon">
                                                        {editingMessage
                                                            ? "✓"
                                                            : "➤"}
                                                    </span>

                                                </>

                                            )}

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </form>


                        <div className="composer-footer">

                            <span>
                                ⏎ Enter to send
                            </span>


                            <span>
                                📎 Max 10 MB
                            </span>


                            <span>
                                ↩ Reply directly to messages
                            </span>


                            <span>
                                🤝 Be respectful
                            </span>

                        </div>

                    </div>

                </section>

            </section>

        </main>

    );

}


export default Community;