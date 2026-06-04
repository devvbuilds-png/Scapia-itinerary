import { MOCK_USERS } from "../data/mockUsers";
import { useApp } from "../store/AppContext";
import { C, FONT, RADIUS, SHADOW } from "../theme";

// Demo control — switch the mock user to watch personalisation change.
// Styled as an intentional "viewing as" row of avatar chips, not a debug box.
export default function UserSwitcher() {
  const { selectedUser, switchUser } = useApp();

  return (
    <div style={s.wrap}>
      <div style={s.label}>
        <span style={s.dot} /> Demo — viewing as
      </div>
      <div className="no-scrollbar" style={s.row}>
        {MOCK_USERS.map((user) => {
          const active = selectedUser.id === user.id;
          const first = user.name.split(" ")[0];
          return (
            <button
              key={user.id}
              onClick={() => switchUser(user.id)}
              title={user.profileSummary}
              style={{ ...s.chip, ...(active ? s.chipActive : {}) }}
            >
              <img
                src={user.avatarUrl}
                alt={first}
                style={{ ...s.avatar, border: active ? `2px solid ${C.coral}` : `2px solid ${C.line}` }}
              />
              <span style={{ ...s.name, color: active ? C.coralDark : C.body }}>{first}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    background: C.card,
    border: `1px solid ${C.line}`,
    borderRadius: RADIUS.lg,
    padding: "10px 12px",
    boxShadow: SHADOW.cardSoft,
    fontFamily: FONT.sans,
  },
  label: {
    fontSize: 10.5,
    fontWeight: 800,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 9,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: "50%", background: C.coral, display: "inline-block" },
  row: { display: "flex", gap: 8, overflowX: "auto" },
  chip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    padding: "4px 6px 6px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    flexShrink: 0,
    width: 58,
    borderRadius: RADIUS.md,
  },
  chipActive: { background: C.coralSoft },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: C.cardAlt,
    objectFit: "cover",
  },
  name: { fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" },
};
