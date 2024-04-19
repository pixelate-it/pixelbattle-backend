export type BadgeIdentificatior =
    | 'DEVELOPER'
    | 'MODERATOR'
    | 'SPONSOR'
    | 'ACTIVE';

export class BadgesGenerator {
    public static readonly badges = new Map<BadgeIdentificatior, number>([
        ['DEVELOPER', 1],
        ['MODERATOR', 2],
        ['SPONSOR', 4],
        ['ACTIVE', 8]
    ]);

    public static encodeUserBadges(userBadges: BadgeIdentificatior[]) {
        let encodedValue = 0;

        userBadges.forEach((badge) => {
            const badgeValue = BadgesGenerator.badges.get(badge);
            if(badgeValue) encodedValue |= badgeValue;
        });

        return encodedValue.toString();
    }

    public static decodeUserBadges(encodedValue: string) {
        const decodedBadges: string[] = [];
        const value = parseInt(encodedValue, 10);

        BadgesGenerator.badges.forEach((badgeValue, badgeName) => {
            if((value & badgeValue) === badgeValue) decodedBadges.push(badgeName);
        });

        return decodedBadges;
    }

    public static hasBadgeInString(encodedValue: string, badgeName: BadgeIdentificatior) {
        const value = parseInt(encodedValue, 10);
        const badgeValue = BadgesGenerator.badges.get(badgeName);

        return badgeValue ? (value & badgeValue) === badgeValue : false;
    }

    public static addBadgeToString(encodedValue: string, badgeName: BadgeIdentificatior) {
        const badgeValue = BadgesGenerator.badges.get(badgeName)!;
        const value = parseInt(encodedValue, 10);
        const updatedValue = value | badgeValue;

        return updatedValue.toString();
    }
}