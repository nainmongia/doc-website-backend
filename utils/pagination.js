const paginationMiddleware = () => {
    return (req, res, next) => {
      console.log(req.query);
      const pageNumber = parseInt(req.query.page) || 1; // Get the current page number from the query parameters
      const pageSize = parseInt(req.query.size);
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
  
      // Attach pagination data to the request object
      req.pagination = {
        page: pageNumber,
        limit: pageSize,
        startIndex,
        endIndex
      };
  
      next(); // Call the next middleware
    };
  };
 
  module.exports = paginationMiddleware;