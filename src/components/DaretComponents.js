import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  AlertCircle,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Trophy,
  ChevronRight,
} from 'lucide-react-native';
import { COLORS } from '../constants/theme';

/* ============================================================
   DARET CARD — Carte résumé d'une Daret
   ============================================================ */
export const DaretCard = ({ daret, onPress, stats, theme }) => {
  const isOverdue =
    daret.nextDueDate && new Date(daret.nextDueDate) < new Date();
  const isActive = daret.status === 'active';
  const totalMonthlyPool = daret.monthlyAmount * daret.members.length;
  const currentRecipient =
    daret.members[daret.currentRoundIndex]?.name || '—';

  const progress =
    daret.totalCycles > 0
      ? (daret.roundHistory.length / daret.totalCycles) * 100
      : 0;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();

  const cardBg = theme?.card || '#fff';
  const textColor = theme?.text || '#111827';
  const subText = theme?.subText || '#6b7280';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={[
          styles.daretCard,
          {
            backgroundColor: cardBg,
            borderColor: isOverdue ? '#dc262640' : 'transparent',
            borderWidth: isOverdue ? 1 : 0,
          },
        ]}
      >
        {/* Bande colorée en haut si actif */}
        {isActive && <View style={styles.activeStripe} />}

        {/* Header : nom + statut + icône */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.daretIconBox,
                {
                  backgroundColor: isActive ? '#00623320' : '#9ca3af20',
                },
              ]}
            >
              <Trophy
                size={20}
                color={isActive ? '#006233' : '#6b7280'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.daretTitle, { color: textColor }]}
                numberOfLines={1}
              >
                {daret.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isActive ? '#d1fae5' : '#fee2e2',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isActive ? '#10b981' : '#ef4444',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: isActive ? '#065f46' : '#991b1b' },
                  ]}
                >
                  {isActive ? 'Actif' : 'Pausé'}
                </Text>
              </View>
            </View>
          </View>
          <ChevronRight size={20} color={subText} />
        </View>

        {/* Grille d'infos */}
        <View style={styles.infoGrid}>
          <InfoTile
            label="Cotisation"
            value={`${daret.monthlyAmount} DH`}
            sub="par mois"
            theme={theme}
          />
          <InfoTile
            label="Pot mensuel"
            value={`${totalMonthlyPool} DH`}
            sub="collecté"
            theme={theme}
            highlight
          />
          <InfoTile
            label="Membres"
            value={`${daret.members.length}`}
            sub="participants"
            theme={theme}
          />
        </View>

        {/* Barre de progression des tours */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressLabelRow}>
              <TrendingUp size={14} color={COLORS.primary} />
              <Text style={[styles.progressLabel, { color: subText }]}>
                Tours complétés
              </Text>
            </View>
            <Text style={[styles.progressValue, { color: textColor }]}>
              {daret.roundHistory.length}
              <Text style={{ color: subText }}>
                /{daret.totalCycles}
              </Text>
            </Text>
          </View>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: theme?.track || '#f3f4f6' },
            ]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: COLORS.primary },
              ]}
            >
              <View style={styles.progressShine} />
            </Animated.View>
          </View>
        </View>

        {/* Bénéficiaire actuel */}
        {daret.members.length > 0 && (
          <View style={styles.recipientBox}>
            <View style={styles.recipientLeft}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientInitial}>
                  {currentRecipient.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.recipientLabel, { color: subText }]}>
                  Prochain bénéficiaire
                </Text>
                <Text
                  style={[styles.recipientName, { color: textColor }]}
                  numberOfLines={1}
                >
                  {currentRecipient}
                </Text>
              </View>
            </View>

            {isOverdue && (
              <View style={styles.overdueBadge}>
                <AlertCircle size={12} color="#dc2626" />
                <Text style={styles.overdueText}>Retard</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

/* Petite tuile d'info */
const InfoTile = ({ label, value, sub, theme, highlight }) => {
  const textColor = theme?.text || '#111827';
  const subText = theme?.subText || '#6b7280';

  return (
    <View
      style={[
        styles.infoTile,
        {
          backgroundColor: highlight
            ? '#00623310'
            : theme?.tile || '#f9fafb',
        },
      ]}
    >
      <Text style={[styles.infoTileLabel, { color: subText }]}>{label}</Text>
      <Text
        style={[
          styles.infoTileValue,
          { color: highlight ? COLORS.primary : textColor },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {sub && (
        <Text style={[styles.infoTileSub, { color: subText }]}>{sub}</Text>
      )}
    </View>
  );
};

/* ============================================================
   MEMBER LIST — Liste des membres avec statut de paiement
   ============================================================ */
export const DaretMemberList = ({ members, round, onMemberPress, theme }) => {
  const paidCount = members.filter((m) =>
    round?.contributions.find((c) => c.memberId === m.id && c.paid)
  ).length;
  const total = members.length;
  const paidPercent = total > 0 ? (paidCount / total) * 100 : 0;

  const textColor = theme?.text || '#111827';
  const subText = theme?.subText || '#6b7280';

  return (
    <View style={styles.memberListContainer}>
      {/* Header avec compteur */}
      <View style={styles.memberListHeader}>
        <View style={styles.memberListTitleRow}>
          <Users size={18} color={COLORS.primary} />
          <Text style={[styles.memberListTitle, { color: textColor }]}>
            Membres
          </Text>
          <View style={styles.memberCountBadge}>
            <Text style={styles.memberCountText}>{total}</Text>
          </View>
        </View>
        <View style={styles.paidBadge}>
          <Text style={styles.paidBadgeText}>
            {paidCount}/{total} payé
          </Text>
        </View>
      </View>

      {/* Barre de progression des paiements */}
      <View
        style={[
          styles.paymentTrack,
          { backgroundColor: theme?.track || '#f3f4f6' },
        ]}
      >
        <View
          style={[
            styles.paymentFill,
            { width: `${paidPercent}%` },
          ]}
        />
      </View>

      {/* Liste des membres */}
      {members.map((member, idx) => {
        const contribution = round?.contributions.find(
          (c) => c.memberId === member.id
        );
        const isPaid = contribution?.paid;

        return (
          <TouchableOpacity
            key={member.id}
            onPress={() => onMemberPress?.(member, round)}
            activeOpacity={0.7}
            style={[
              styles.memberRow,
              {
                backgroundColor: isPaid
                  ? '#f0fdf4'
                  : theme?.tile || '#f9fafb',
                borderLeftColor: isPaid ? COLORS.primary : '#d1d5db',
              },
            ]}
          >
            {/* Avatar avec initiale */}
            <View
              style={[
                styles.memberAvatar,
                {
                  backgroundColor: isPaid ? '#00623320' : '#9ca3af20',
                },
              ]}
            >
              <Text
                style={[
                  styles.memberAvatarText,
                  { color: isPaid ? COLORS.primary : '#6b7280' },
                ]}
              >
                {member.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Nom + statut */}
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.memberName, { color: textColor }]}
                numberOfLines={1}
              >
                {member.name}
              </Text>
              <View style={styles.memberStatusRow}>
                {isPaid ? (
                  <CheckCircle2 size={12} color={COLORS.primary} />
                ) : (
                  <Clock size={12} color="#9ca3af" />
                )}
                <Text
                  style={[
                    styles.memberStatus,
                    { color: isPaid ? COLORS.primary : subText },
                  ]}
                >
                  {isPaid ? 'Payé' : 'En attente'}
                </Text>
              </View>
            </View>

            {/* Montant */}
            <View style={styles.memberAmountBox}>
              <Text
                style={[
                  styles.memberAmountValue,
                  { color: isPaid ? COLORS.primary : textColor },
                ]}
              >
                {contribution?.amount || 0}
              </Text>
              <Text style={[styles.memberAmountUnit, { color: subText }]}>
                DH
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/* ============================================================
   ROUND TIMELINE — Timeline d'un tour
   ============================================================ */
export const DaretRoundTimeline = ({ round, recipientName, theme }) => {
  const plannedDate = new Date(round.plannedDate);
  const receivedDate = round.receivedDate
    ? new Date(round.receivedDate)
    : null;
  const daysDifference = receivedDate
    ? Math.floor((receivedDate - plannedDate) / (1000 * 60 * 60 * 24))
    : null;

  const isLate = daysDifference && daysDifference > 0;

  const textColor = theme?.text || '#111827';
  const subText = theme?.subText || '#6b7280';

  return (
    <View style={styles.timelineContainer}>
      {/* Header du tour */}
      <View style={styles.timelineHeader}>
        <View style={styles.timelineHeaderLeft}>
          <View style={styles.roundBadge}>
            <Text style={styles.roundBadgeText}>#{round.roundNumber}</Text>
          </View>
          <Text style={[styles.roundTitle, { color: textColor }]}>
            Tour en cours
          </Text>
        </View>
        <Text style={styles.totalAmount}>{round.totalAmount} DH</Text>
      </View>

      {/* Contenu */}
      <View
        style={[
          styles.timelineContent,
          { backgroundColor: theme?.tile || '#f9fafb' },
        ]}
      >
        {/* Étapes */}
        <TimelineStep
          label="Date prévue"
          date={plannedDate}
          color={COLORS.primary}
          isDone
          subText={subText}
          textColor={textColor}
        />

        {receivedDate && (
          <TimelineStep
            label="Date reçue"
            date={receivedDate}
            color={isLate ? '#dc2626' : COLORS.primary}
            isDone
            subText={subText}
            textColor={textColor}
            extra={
              isLate
                ? `⚠️ ${daysDifference} jour${
                    daysDifference > 1 ? 's' : ''
                  } de retard`
                : '✅ Dans les temps'
            }
            extraColor={isLate ? '#dc2626' : COLORS.primary}
          />
        )}

        {!receivedDate && (
          <TimelineStep
            label="En attente de réception"
            date={null}
            color="#9ca3af"
            isDone={false}
            subText={subText}
            textColor={textColor}
          />
        )}
      </View>

      {/* Bénéficiaire */}
      <View style={styles.recipientRow}>
        <View style={styles.recipientAvatarLg}>
          <Text style={styles.recipientAvatarLgText}>
            {recipientName?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.recipientBoxLabel, { color: subText }]}>
            Bénéficiaire de ce tour
          </Text>
          <Text style={[styles.recipientBoxName, { color: textColor }]}>
            {recipientName || '—'}
          </Text>
        </View>
        <Calendar size={16} color={COLORS.primary} />
      </View>
    </View>
  );
};

/* Étape de la timeline */
const TimelineStep = ({
  label,
  date,
  color,
  isDone,
  extra,
  extraColor,
  subText,
  textColor,
}) => (
  <View style={styles.timelineStep}>
    <View style={styles.timelineMarkerCol}>
      <View
        style={[
          styles.timelineMarkerDot,
          { backgroundColor: color, opacity: isDone ? 1 : 0.4 },
        ]}
      >
        {isDone && <View style={styles.timelineMarkerInner} />}
      </View>
    </View>
    <View style={styles.timelineTextBox}>
      <Text style={[styles.timelineStepLabel, { color: subText }]}>
        {label}
      </Text>
      {date && (
        <Text style={[styles.timelineStepDate, { color: textColor }]}>
          {date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      )}
      {extra && (
        <Text style={[styles.timelineStepExtra, { color: extraColor }]}>
          {extra}
        </Text>
      )}
    </View>
  </View>
);

/* ============================================================
   STATS CARD — Statistiques d'une Daret
   ============================================================ */
export const DaretStatsCard = ({ stats, theme }) => {
  if (!stats) return null;

  const textColor = theme?.text || '#111827';
  const subText = theme?.subText || '#6b7280';

  return (
    <View
      style={[
        styles.statsContainer,
        { backgroundColor: theme?.card || '#fff' },
      ]}
    >
      {/* Titre */}
      <View style={styles.statsHeader}>
        <View style={styles.statsHeaderLeft}>
          <View style={styles.statsIconBox}>
            <TrendingUp size={18} color={COLORS.primary} />
          </View>
          <Text style={[styles.statsTitle, { color: textColor }]}>
            Statistiques
          </Text>
        </View>
      </View>

      {/* Grille 2 colonnes */}
      <View style={styles.statsGrid}>
        <BigStat
          label="Total versé"
          value={`${stats.totalContributed}`}
          unit="DH"
          theme={theme}
        />
        <BigStat
          label="Tours complétés"
          value={`${stats.totalRoundsCompleted}`}
          unit="tours"
          theme={theme}
        />
      </View>

      {/* Titre sous-section */}
      <Text style={[styles.memberStatsTitle, { color: subText }]}>
        CONTRIBUTIONS PAR MEMBRE
      </Text>

      {/* Liste des membres */}
      {Object.entries(stats.memberStats).map(([memberId, stat], idx) => (
        <View
          key={memberId}
          style={[
            styles.memberStatRow,
            {
              borderBottomColor:
                idx === Object.entries(stats.memberStats).length - 1
                  ? 'transparent'
                  : theme?.track || '#f0f0f0',
            },
          ]}
        >
          <View style={styles.memberStatRowLeft}>
            <View style={styles.memberStatAvatar}>
              <Text style={styles.memberStatAvatarText}>
                {stat.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.memberStatName, { color: textColor }]}>
                {stat.name}
              </Text>
              <Text style={[styles.memberStatDetail, { color: subText }]}>
                {stat.timesReceived}x bénéficiaire
              </Text>
            </View>
          </View>
          <View style={styles.memberStatRowRight}>
            <Text style={styles.memberStatAmount}>
              {stat.totalContributed}
            </Text>
            <Text style={[styles.memberStatUnit, { color: subText }]}>
              DH
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

/* Grande tuile de stat */
const BigStat = ({ label, value, unit, theme }) => {
  const subText = theme?.subText || '#6b7280';

  return (
    <View style={styles.bigStatBox}>
      <Text style={[styles.bigStatLabel, { color: subText }]}>
        {label}
      </Text>
      <View style={styles.bigStatValueRow}>
        <Text style={styles.bigStatValue}>{value}</Text>
        <Text style={styles.bigStatUnit}>{unit}</Text>
      </View>
    </View>
  );
};

/* ============================================================
   STYLES
   ============================================================ */
const styles = StyleSheet.create({
  /* ============ DARET CARD ============ */
  daretCard: {
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  activeStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  daretIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daretTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* Info grid */
  infoGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  infoTile: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoTileLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  infoTileValue: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  infoTileSub: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },

  /* Progress */
  progressSection: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  /* Recipient */
  recipientBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  recipientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  recipientAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#00623320',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientInitial: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  recipientLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recipientName: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },

  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  overdueText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* ============ MEMBER LIST ============ */
  memberListContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  memberListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberListTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberListTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  memberCountBadge: {
    backgroundColor: '#00623320',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  memberCountText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  paidBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
  },
  paymentTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  paymentFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 14,
    borderLeftWidth: 3,
    gap: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '900',
  },
  memberName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  memberStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  memberStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  memberAmountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  memberAmountValue: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  memberAmountUnit: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* ============ ROUND TIMELINE ============ */
  timelineContainer: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundBadge: {
    backgroundColor: '#00623320',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  roundBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primary,
  },
  roundTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  timelineContent: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  timelineMarkerCol: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2,
  },
  timelineMarkerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineMarkerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  timelineTextBox: {
    flex: 1,
    paddingLeft: 8,
  },
  timelineStepLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  timelineStepDate: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  timelineStepExtra: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#00623310',
  },
  recipientAvatarLg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#00623320',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientAvatarLgText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  recipientBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recipientBoxName: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.3,
  },

  /* ============ STATS CARD ============ */
  statsContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#00623320',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  bigStatBox: {
    flex: 1,
    backgroundColor: '#00623310',
    padding: 14,
    borderRadius: 14,
  },
  bigStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  bigStatValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bigStatValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  bigStatUnit: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    opacity: 0.7,
  },
  memberStatsTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  memberStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  memberStatRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  memberStatAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#00623320',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberStatAvatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  memberStatName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  memberStatDetail: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  memberStatRowRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  memberStatAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  memberStatUnit: {
    fontSize: 11,
    fontWeight: '700',
  },
});