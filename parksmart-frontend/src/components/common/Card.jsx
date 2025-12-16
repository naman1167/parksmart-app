const Card = ({ children, className = '', onClick, gradient = false }) => {
    return (
        <div
            className={`glass rounded-2xl p-6 transition-all duration-300 ${onClick ? 'cursor-pointer card-hover hover:border-indigo-300' : 'hover:border-gray-300'
                } ${gradient ? 'bg-gradient-to-br from-indigo-50 to-white' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
