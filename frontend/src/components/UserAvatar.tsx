import { Avatar, type SxProps, type Theme } from "@mui/material";
import type { User } from "../types";
import { avatarColor, initials } from "../utils";

interface Props {
  user: Pick<User, "displayName" | "avatarImage">;
  size?: number;
  sx?: SxProps<Theme>;
}

export default function UserAvatar({ user, size = 32, sx }: Props) {
  if (user.avatarImage) {
    return (
      <Avatar
        src={user.avatarImage}
        alt={user.displayName}
        sx={[{ width: size, height: size }, ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  }

  return (
    <Avatar
      sx={[
        {
          bgcolor: avatarColor(user.displayName),
          width: size,
          height: size,
          fontSize: size * 0.4,
          fontWeight: 600,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials(user.displayName)}
    </Avatar>
  );
}