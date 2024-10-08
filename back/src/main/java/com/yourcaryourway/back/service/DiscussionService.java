package com.yourcaryourway.back.service;

import com.yourcaryourway.back.entity.Discussion;

import java.util.List;

public interface DiscussionService {
    Discussion createDiscussion(Discussion discussion);
    List<Discussion> getAllDiscussions();
    List<Discussion> getDiscussionsByUserId(int userId);
    Discussion getDiscussionById(int discussionId);
    Discussion updateDiscussionStatusById(String statusName, int discussionId);
}
