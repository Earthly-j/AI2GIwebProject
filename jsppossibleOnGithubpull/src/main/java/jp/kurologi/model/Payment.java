package jp.kurologi.model;

import java.time.LocalDateTime;
import java.util.List;

import jp.kurologi.web.Formats;

/** 결제 1건 — 대기건 여러 개를 한 번에 결제할 수 있습니다. 결제내역 탭에 표시됩니다. */
public class Payment {

    public enum Method {
        BANK("무통장입금"), CARD("신용카드(토스)"), DEPOSIT("예치금");

        private final String label;
        Method(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    public enum Status {
        AWAITING_DEPOSIT("입금확인중"), AWAITING_CARD("카드결제 진행중"), PAID("결제완료"), CANCELED("취소");

        private final String label;
        Status(String label) { this.label = label; }
        public String getLabel() { return label; }
    }

    private long id;
    private long memberId;
    private List<Long> chargeIds;
    private String summary;        // 대표 항목명 외 N건
    private Method method;
    private long totalAmount;      // 선택한 대기건 합계
    private long couponDiscount;
    private long depositUsed;
    private long payAmount;        // 실제 입금/카드 결제할 금액 = total - coupon - deposit
    private String depositorName;
    private Status status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    public String getCreatedAtText() { return Formats.dateTime(createdAt); }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public long getMemberId() { return memberId; }
    public void setMemberId(long memberId) { this.memberId = memberId; }
    public List<Long> getChargeIds() { return chargeIds; }
    public void setChargeIds(List<Long> chargeIds) { this.chargeIds = List.copyOf(chargeIds); }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public Method getMethod() { return method; }
    public void setMethod(Method method) { this.method = method; }
    public long getTotalAmount() { return totalAmount; }
    public void setTotalAmount(long totalAmount) { this.totalAmount = totalAmount; }
    public long getCouponDiscount() { return couponDiscount; }
    public void setCouponDiscount(long couponDiscount) { this.couponDiscount = couponDiscount; }
    public long getDepositUsed() { return depositUsed; }
    public void setDepositUsed(long depositUsed) { this.depositUsed = depositUsed; }
    public long getPayAmount() { return payAmount; }
    public void setPayAmount(long payAmount) { this.payAmount = payAmount; }
    public String getDepositorName() { return depositorName; }
    public void setDepositorName(String depositorName) { this.depositorName = depositorName; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}
